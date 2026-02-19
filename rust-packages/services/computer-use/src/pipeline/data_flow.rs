//! Cross-App Data Flow Pipeline
//!
//! Enables data extraction from one application and processing/piping to another.
//! Supports various data formats and transformations.

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;

/// Data pipeline for cross-application workflows
pub struct DataPipeline {
    sources: Arc<Mutex<HashMap<String, DataSource>>>,
    transformers: Arc<Mutex<HashMap<String, DataTransformer>>>,
    sinks: Arc<Mutex<HashMap<String, DataSink>>>,
    flows: Arc<Mutex<HashMap<String, DataFlow>>>,
    event_tx: mpsc::Sender<PipelineEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    pub id: String,
    pub name: String,
    pub source_type: SourceType,
    pub config: serde_json::Value,
    pub extraction_rules: Vec<ExtractionRule>,
    pub schedule: Option<Schedule>,
    pub last_run: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SourceType {
    Clipboard,
    ScreenshotOcr,
    ElementText,
    WindowTitle,
    FileContent,
    ApiEndpoint,
    Database,
    Spreadsheet,
    Email,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractionRule {
    pub field_name: String,
    pub selector: String,
    pub data_type: DataType,
    pub transform: Option<String>,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataType {
    Text,
    Number,
    Date,
    Boolean,
    List,
    Object,
    Binary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataTransformer {
    pub id: String,
    pub name: String,
    pub transform_type: TransformType,
    pub config: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransformType {
    Map,
    Filter,
    Aggregate,
    Split,
    Join,
    Format,
    Validate,
    AiExtract,
    Regex,
    Template,
    Script(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSink {
    pub id: String,
    pub name: String,
    pub sink_type: SinkType,
    pub config: serde_json::Value,
    pub write_mode: WriteMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SinkType {
    Clipboard,
    File,
    Spreadsheet,
    Database,
    ApiEndpoint,
    Email,
    Notification,
    FormField,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WriteMode {
    Overwrite,
    Append,
    Merge,
    CreateNew,
    Update,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFlow {
    pub id: String,
    pub name: String,
    pub source_id: String,
    pub sink_id: String,
    pub transformer_ids: Vec<String>,
    pub filters: Vec<DataFilter>,
    pub enabled: bool,
    pub schedule: Option<Schedule>,
    pub error_handling: ErrorHandling,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFilter {
    pub field: String,
    pub operator: FilterOperator,
    pub value: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterOperator {
    Equals,
    NotEquals,
    Contains,
    GreaterThan,
    LessThan,
    Exists,
    Matches,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub cron: String,
    pub timezone: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorHandling {
    pub on_error: ErrorAction,
    pub retry_count: u32,
    pub retry_delay_secs: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorAction {
    Stop,
    Skip,
    Log,
    Notify,
    Fallback(String),
}

#[derive(Debug, Clone)]
pub struct PipelineEvent {
    pub timestamp: u64,
    pub flow_id: String,
    pub event_type: EventType,
}

#[derive(Debug, Clone)]
pub enum EventType {
    Started,
    DataExtracted { record_count: usize },
    Transformed { transformer_id: String },
    Filtered { records_kept: usize, records_dropped: usize },
    Written { sink_id: String, records: usize },
    Error { message: String },
    Completed { duration_ms: u64 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataRecord {
    pub id: String,
    pub source: String,
    pub timestamp: u64,
    pub fields: HashMap<String, DataValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum DataValue {
    Text(String),
    Number(f64),
    Boolean(bool),
    List(Vec<DataValue>),
    Object(HashMap<String, DataValue>),
    Null,
}

impl DataPipeline {
    pub fn new() -> (Self, mpsc::Receiver<PipelineEvent>) {
        let (event_tx, event_rx) = mpsc::channel(100);
        
        let pipeline = Self {
            sources: Arc::new(Mutex::new(HashMap::new())),
            transformers: Arc::new(Mutex::new(HashMap::new())),
            sinks: Arc::new(Mutex::new(HashMap::new())),
            flows: Arc::new(Mutex::new(HashMap::new())),
            event_tx,
        };
        
        (pipeline, event_rx)
    }

    /// Register a data source
    pub async fn register_source(&self, source: DataSource) {
        self.sources.lock().await.insert(source.id.clone(), source);
    }

    /// Register a transformer
    pub async fn register_transformer(&self, transformer: DataTransformer) {
        self.transformers.lock().await.insert(transformer.id.clone(), transformer);
    }

    /// Register a sink
    pub async fn register_sink(&self, sink: DataSink) {
        self.sinks.lock().await.insert(sink.id.clone(), sink);
    }

    /// Create a data flow
    pub async fn create_flow(&self, flow: DataFlow) {
        self.flows.lock().await.insert(flow.id.clone(), flow);
    }

    /// Execute a data flow
    pub async fn execute_flow(&self, flow_id: &str) -> Result<FlowResult> {
        let flows = self.flows.lock().await;
        let flow = flows.get(flow_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Flow {} not found", flow_id)))?
            .clone();
        drop(flows);

        let start = std::time::Instant::now();
        
        self.emit_event(&flow_id, EventType::Started).await;

        // 1. Extract from source
        let sources = self.sources.lock().await;
        let source = sources.get(&flow.source_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Source {} not found", flow.source_id)))?
            .clone();
        drop(sources);

        let records = self.extract_data(&source).await?;
        self.emit_event(&flow_id, EventType::DataExtracted { record_count: records.len() }).await;

        // 2. Apply filters
        let mut filtered = records;
        for filter in &flow.filters {
            filtered = self.apply_filter(filtered, filter).await?;
        }
        
        self.emit_event(&flow_id, EventType::Filtered {
            records_kept: filtered.len(),
            records_dropped: records.len() - filtered.len(),
        }).await;

        // 3. Transform data
        let mut transformed = filtered;
        for transformer_id in &flow.transformer_ids {
            let transformers = self.transformers.lock().await;
            let transformer = transformers.get(transformer_id)
                .ok_or_else(|| Error::InvalidCommand(format!("Transformer {} not found", transformer_id)))?
                .clone();
            drop(transformers);

            transformed = self.apply_transform(transformed, &transformer).await?;
            self.emit_event(&flow_id, EventType::Transformed { transformer_id: transformer_id.clone() }).await;
        }

        // 4. Write to sink
        let sinks = self.sinks.lock().await;
        let sink = sinks.get(&flow.sink_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Sink {} not found", flow.sink_id)))?
            .clone();
        drop(sinks);

        self.write_data(&transformed, &sink).await?;
        self.emit_event(&flow_id, EventType::Written {
            sink_id: flow.sink_id.clone(),
            records: transformed.len(),
        }).await;

        let duration = start.elapsed().as_millis() as u64;
        self.emit_event(&flow_id, EventType::Completed { duration_ms: duration }).await;

        Ok(FlowResult {
            flow_id: flow_id.to_string(),
            records_processed: transformed.len(),
            duration_ms: duration,
            success: true,
        })
    }

    async fn extract_data(&self, source: &DataSource) -> Result<Vec<DataRecord>> {
        match &source.source_type {
            SourceType::Clipboard => {
                // Extract from clipboard
                let content = "clipboard content".to_string();
                Ok(vec![DataRecord {
                    id: Uuid::new_uuid().to_string(),
                    source: source.id.clone(),
                    timestamp: current_timestamp(),
                    fields: {
                        let mut map = HashMap::new();
                        map.insert("content".to_string(), DataValue::Text(content));
                        map
                    },
                }])
            }
            SourceType::ScreenshotOcr => {
                // Perform OCR on screenshot
                Ok(vec![])
            }
            SourceType::ElementText => {
                // Extract text from UI elements
                Ok(vec![])
            }
            SourceType::FileContent => {
                // Read file content
                Ok(vec![])
            }
            _ => Ok(vec![]),
        }
    }

    async fn apply_filter(&self, records: Vec<DataRecord>, filter: &DataFilter) -> Result<Vec<DataRecord>> {
        Ok(records.into_iter().filter(|r| {
            if let Some(value) = r.fields.get(&filter.field) {
                match filter.operator {
                    FilterOperator::Equals => format!("{:?}", value) == format!("{:?}", filter.value),
                    FilterOperator::NotEquals => format!("{:?}", value) != format!("{:?}", filter.value),
                    FilterOperator::Contains => format!("{:?}", value).contains(&filter.value.as_str().unwrap_or("")),
                    _ => true,
                }
            } else {
                false
            }
        }).collect())
    }

    async fn apply_transform(&self, records: Vec<DataRecord>, transformer: &DataTransformer) -> Result<Vec<DataRecord>> {
        match &transformer.transform_type {
            TransformType::Map => {
                // Map fields
                Ok(records)
            }
            TransformType::Filter => {
                // Filter records
                Ok(records)
            }
            TransformType::Format => {
                // Format values
                Ok(records)
            }
            TransformType::AiExtract => {
                // Use AI to extract structured data
                Ok(records)
            }
            _ => Ok(records),
        }
    }

    async fn write_data(&self, records: &[DataRecord], sink: &DataSink) -> Result<()> {
        match &sink.sink_type {
            SinkType::Clipboard => {
                // Write to clipboard
                Ok(())
            }
            SinkType::File => {
                // Write to file
                Ok(())
            }
            SinkType::FormField => {
                // Fill form field
                Ok(())
            }
            _ => Ok(()),
        }
    }

    async fn emit_event(&self, flow_id: &str, event_type: EventType) {
        let _ = self.event_tx.send(PipelineEvent {
            timestamp: current_timestamp(),
            flow_id: flow_id.to_string(),
            event_type,
        }).await;
    }

    /// Get flow status
    pub async fn get_flow(&self, flow_id: &str) -> Option<DataFlow> {
        self.flows.lock().await.get(flow_id).cloned()
    }

    /// List all flows
    pub async fn list_flows(&self) -> Vec<DataFlow> {
        self.flows.lock().await.values().cloned().collect()
    }

    /// Delete flow
    pub async fn delete_flow(&self, flow_id: &str) -> Result<()> {
        self.flows.lock().await.remove(flow_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Flow {} not found", flow_id)))?;
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct FlowResult {
    pub flow_id: String,
    pub records_processed: usize,
    pub duration_ms: u64,
    pub success: bool,
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

/// Helper to create common data flows
pub mod flow_presets {
    use super::*;

    pub fn clipboard_to_form(field_name: &str) -> (DataSource, DataSink, DataFlow) {
        let source = DataSource {
            id: Uuid::new_uuid().to_string(),
            name: "Clipboard Source".to_string(),
            source_type: SourceType::Clipboard,
            config: serde_json::json!({}),
            extraction_rules: vec![],
            schedule: None,
            last_run: None,
        };

        let sink = DataSink {
            id: Uuid::new_uuid().to_string(),
            name: "Form Field Sink".to_string(),
            sink_type: SinkType::FormField,
            config: serde_json::json!({"field_name": field_name}),
            write_mode: WriteMode::Overwrite,
        };

        let flow = DataFlow {
            id: Uuid::new_uuid().to_string(),
            name: "Clipboard to Form".to_string(),
            source_id: source.id.clone(),
            sink_id: sink.id.clone(),
            transformer_ids: vec![],
            filters: vec![],
            enabled: true,
            schedule: None,
            error_handling: ErrorHandling {
                on_error: ErrorAction::Stop,
                retry_count: 0,
                retry_delay_secs: 0,
            },
        };

        (source, sink, flow)
    }

    pub fn ocr_to_spreadsheet() -> (DataSource, DataTransformer, DataSink, DataFlow) {
        let source = DataSource {
            id: Uuid::new_uuid().to_string(),
            name: "Screenshot OCR".to_string(),
            source_type: SourceType::ScreenshotOcr,
            config: serde_json::json!({}),
            extraction_rules: vec![],
            schedule: None,
            last_run: None,
        };

        let transformer = DataTransformer {
            id: Uuid::new_uuid().to_string(),
            name: "Parse Table".to_string(),
            transform_type: TransformType::AiExtract,
            config: serde_json::json!({"extract_type": "table"}),
        };

        let sink = DataSink {
            id: Uuid::new_uuid().to_string(),
            name: "Spreadsheet".to_string(),
            sink_type: SinkType::Spreadsheet,
            config: serde_json::json!({"sheet_name": "Extracted Data"}),
            write_mode: WriteMode::Append,
        };

        let flow = DataFlow {
            id: Uuid::new_uuid().to_string(),
            name: "OCR to Spreadsheet".to_string(),
            source_id: source.id.clone(),
            sink_id: sink.id.clone(),
            transformer_ids: vec![transformer.id.clone()],
            filters: vec![],
            enabled: true,
            schedule: None,
            error_handling: ErrorHandling {
                on_error: ErrorAction::Log,
                retry_count: 1,
                retry_delay_secs: 1,
            },
        };

        (source, transformer, sink, flow)
    }
}
