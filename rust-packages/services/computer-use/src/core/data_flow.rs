//! Cross-App Data Flow (Feature 6)
//!
//! Automatically transfer data between applications (enhanced clipboard)

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Data source application
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    pub app_name: String,
    pub window_title: Option<String>,
    pub element_selector: String,
    pub data_type: DataType,
}

/// Data destination application
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataDestination {
    pub app_name: String,
    pub window_title: Option<String>,
    pub element_selector: String,
    pub data_type: DataType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataType {
    Text,
    Number,
    Date,
    Table { rows: usize, cols: usize },
    Image,
    File { path: String },
    Json,
    Custom(String),
}

/// Data transformation operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Transform {
    Trim,
    Uppercase,
    Lowercase,
    Replace { pattern: String, replacement: String },
    Extract { pattern: String },
    Format { template: String },
    Calculate { formula: String },
    Map { mappings: HashMap<String, String> },
}

/// Data flow definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFlow {
    pub id: String,
    pub name: String,
    pub source: DataSource,
    pub destination: DataDestination,
    pub transforms: Vec<Transform>,
    pub validation: Option<ValidationRule>,
    pub on_error: ErrorHandling,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRule {
    pub required: bool,
    pub min_length: Option<usize>,
    pub max_length: Option<usize>,
    pub pattern: Option<String>,
    pub custom_check: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorHandling {
    Stop,
    Skip,
    DefaultValue(String),
    AskUser,
}

/// Result of data extraction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractedData {
    pub raw_value: String,
    pub processed_value: String,
    pub data_type: DataType,
    pub confidence: f32,
    pub metadata: HashMap<String, String>,
}

/// Cross-app data flow engine
pub struct DataFlowEngine {
    flows: Vec<DataFlow>,
    clipboard: EnhancedClipboard,
    transform_registry: HashMap<String, Box<dyn Fn(&str) -> Result<String>>>,
}

/// Enhanced clipboard with history and metadata
#[derive(Debug, Clone, Default)]
pub struct EnhancedClipboard {
    history: Vec<ClipboardEntry>,
    max_history: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardEntry {
    pub content: String,
    pub data_type: DataType,
    pub source_app: Option<String>,
    pub timestamp: u64,
    pub metadata: HashMap<String, String>,
}

impl DataFlowEngine {
    pub fn new() -> Self {
        Self {
            flows: Vec::new(),
            clipboard: EnhancedClipboard::new(50),
            transform_registry: HashMap::new(),
        }
    }

    /// Register a data flow
    pub fn register_flow(&mut self, flow: DataFlow) {
        self.flows.push(flow);
    }

    /// Execute data flow by ID
    pub async fn execute_flow(&mut self, flow_id: &str) -> Result<TransferResult> {
        let flow = self.flows
            .iter()
            .find(|f| f.id == flow_id)
            .ok_or_else(|| anyhow::anyhow!("Flow not found: {}", flow_id))?;

        self.execute_data_flow(flow).await
    }

    /// Execute all registered flows
    pub async fn execute_all(&mut self) -> Vec<Result<TransferResult>> {
        let mut results = Vec::new();
        let flows: Vec<DataFlow> = self.flows.clone();
        
        for flow in flows {
            results.push(self.execute_data_flow(&flow).await);
        }
        
        results
    }

    /// Extract data from source
    pub async fn extract(&self, source: &DataSource) -> Result<ExtractedData> {
        // 1. Focus source application
        self.focus_app(&source.app_name).await?;

        // 2. Extract data from element
        let raw_value = self.extract_from_element(&source.element_selector).await?;

        // 3. Detect and convert data type
        let data_type = self.detect_data_type(&raw_value, &source.data_type);

        Ok(ExtractedData {
            raw_value: raw_value.clone(),
            processed_value: raw_value,
            data_type,
            confidence: 1.0,
            metadata: HashMap::new(),
        })
    }

    /// Insert data to destination
    pub async fn insert(&self, destination: &DataDestination, data: &ExtractedData) -> Result<()> {
        // 1. Focus destination application
        self.focus_app(&destination.app_name).await?;

        // 2. Insert data to element
        self.insert_to_element(&destination.element_selector, &data.processed_value).await?;

        Ok(())
    }

    /// Copy data with enhanced metadata
    pub async fn smart_copy(&mut self, source: &DataSource) -> Result<ClipboardEntry> {
        let data = self.extract(source).await?;
        
        let entry = ClipboardEntry {
            content: data.processed_value.clone(),
            data_type: data.data_type.clone(),
            source_app: Some(source.app_name.clone()),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            metadata: data.metadata,
        };

        self.clipboard.push(entry.clone());

        // Also set system clipboard
        self.set_system_clipboard(&data.processed_value).await?;

        Ok(entry)
    }

    /// Paste data with transformation
    pub async fn smart_paste(&self, destination: &DataDestination, transforms: &[Transform]) -> Result<()> {
        // Get from clipboard
        let content = self.get_system_clipboard().await?;
        
        // Apply transforms
        let mut processed = content.clone();
        for transform in transforms {
            processed = self.apply_transform(&processed, transform)?;
        }

        // Insert to destination
        let data = ExtractedData {
            raw_value: content,
            processed_value: processed,
            data_type: destination.data_type.clone(),
            confidence: 1.0,
            metadata: HashMap::new(),
        };

        self.insert(destination, &data).await
    }

    /// Transfer data between apps in one operation
    pub async fn transfer(&mut self, source: &DataSource, destination: &DataDestination, transforms: &[Transform]) -> Result<TransferResult> {
        let start = std::time::Instant::now();
        
        // Extract
        let mut data = self.extract(source).await?;
        
        // Apply transforms
        for transform in transforms {
            data.processed_value = self.apply_transform(&data.processed_value, transform)?;
        }

        // Validate
        if let Some(validation) = self.get_validation_for_destination(destination) {
            if !self.validate(&data.processed_value, &validation) {
                return match destination.data_type {
                    DataType::Text | DataType::Number | DataType::Date => {
                        Err(anyhow::anyhow!("Validation failed for data transfer"))
                    }
                    _ => Ok(TransferResult {
                        success: false,
                        bytes_transferred: 0,
                        duration: start.elapsed(),
                        transforms_applied: transforms.len(),
                    }),
                };
            }
        }

        // Insert
        self.insert(destination, &data).await?;

        Ok(TransferResult {
            success: true,
            bytes_transferred: data.processed_value.len(),
            duration: start.elapsed(),
            transforms_applied: transforms.len(),
        })
    }

    /// Get clipboard history
    pub fn get_clipboard_history(&self) -> &[ClipboardEntry] {
        &self.clipboard.history
    }

    /// Search clipboard history
    pub fn search_clipboard(&self, query: &str) -> Vec<&ClipboardEntry> {
        self.clipboard
            .history
            .iter()
            .filter(|e| e.content.contains(query))
            .collect()
    }

    async fn execute_data_flow(&mut self, flow: &DataFlow) -> Result<TransferResult> {
        self.transfer(&flow.source, &flow.destination, &flow.transforms).await
    }

    async fn focus_app(&self, _app_name: &str) -> Result<()> {
        // Focus application window
        Ok(())
    }

    async fn extract_from_element(&self, _selector: &str) -> Result<String> {
        // Extract text/value from element
        Ok(String::new())
    }

    async fn insert_to_element(&self, _selector: &str, _value: &str) -> Result<()> {
        // Insert text/value to element
        Ok(())
    }

    fn detect_data_type(&self, value: &str, hint: &DataType) -> DataType {
        match hint {
            DataType::Number => {
                if value.parse::<f64>().is_ok() {
                    DataType::Number
                } else {
                    DataType::Text
                }
            }
            DataType::Date => DataType::Date,
            _ => DataType::Text,
        }
    }

    fn apply_transform(&self, value: &str, transform: &Transform) -> Result<String> {
        match transform {
            Transform::Trim => Ok(value.trim().to_string()),
            Transform::Uppercase => Ok(value.to_uppercase()),
            Transform::Lowercase => Ok(value.to_lowercase()),
            Transform::Replace { pattern, replacement } => Ok(value.replace(pattern, replacement)),
            Transform::Extract { pattern } => {
                // Extract matching pattern
                Ok(value.chars().take(pattern.len()).collect())
            }
            Transform::Format { template } => Ok(template.replace("{value}", value)),
            Transform::Calculate { formula: _ } => Ok(value.to_string()),
            Transform::Map { mappings } => Ok(mappings.get(value).cloned().unwrap_or_else(|| value.to_string())),
        }
    }

    fn get_validation_for_destination(&self, _destination: &DataDestination) -> Option<ValidationRule> {
        None
    }

    fn validate(&self, value: &str, rule: &ValidationRule) -> bool {
        if rule.required && value.is_empty() {
            return false;
        }

        if let Some(min) = rule.min_length {
            if value.len() < min {
                return false;
            }
        }

        if let Some(max) = rule.max_length {
            if value.len() > max {
                return false;
            }
        }

        true
    }

    async fn set_system_clipboard(&self, _content: &str) -> Result<()> {
        Ok(())
    }

    async fn get_system_clipboard(&self) -> Result<String> {
        Ok(String::new())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferResult {
    pub success: bool,
    pub bytes_transferred: usize,
    pub duration: std::time::Duration,
    pub transforms_applied: usize,
}

impl EnhancedClipboard {
    fn new(max_history: usize) -> Self {
        Self {
            history: Vec::new(),
            max_history,
        }
    }

    fn push(&mut self, entry: ClipboardEntry) {
        self.history.push(entry);
        if self.history.len() > self.max_history {
            self.history.remove(0);
        }
    }
}
