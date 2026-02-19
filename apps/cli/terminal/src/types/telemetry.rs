use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum TelemetryEventLevel {
    Debug,
    Info,
    Warn,
    Error,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum TelemetryEventType {
    AppStart,
    AppStop,
    SessionStart,
    SessionEnd,
    TabCreated,
    TabClosed,
    PaneCreated,
    PaneClosed,
    CommandExecuted,
    CommandFailed,
    Error,
    Warning,
    Info,
    Performance,
    Custom(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TelemetryEvent {
    pub id: String,
    pub event_type: TelemetryEventType,
    pub level: TelemetryEventLevel,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub message: String,
    pub data: HashMap<String, serde_json::Value>,
    pub session_id: Option<String>,
    pub user_id: Option<String>,
}

impl TelemetryEvent {
    pub fn new(event_type: TelemetryEventType, message: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            event_type,
            level: TelemetryEventLevel::Info,
            timestamp: chrono::Utc::now(),
            message,
            data: HashMap::new(),
            session_id: None,
            user_id: None,
        }
    }

    pub fn with_level(mut self, level: TelemetryEventLevel) -> Self {
        self.level = level;
        self
    }

    pub fn with_data(mut self, key: String, value: serde_json::Value) -> Self {
        self.data.insert(key, value);
        self
    }

    pub fn with_session_id(mut self, session_id: String) -> Self {
        self.session_id = Some(session_id);
        self
    }

    pub fn with_user_id(mut self, user_id: String) -> Self {
        self.user_id = Some(user_id);
        self
    }

    pub fn is_error(&self) -> bool {
        matches!(self.level, TelemetryEventLevel::Error)
    }

    pub fn is_warning(&self) -> bool {
        matches!(self.level, TelemetryEventLevel::Warn)
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TelemetryMetric {
    pub name: String,
    pub value: f64,
    pub unit: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub tags: HashMap<String, String>,
}

impl TelemetryMetric {
    pub fn new(name: String, value: f64) -> Self {
        Self {
            name,
            value,
            unit: None,
            timestamp: chrono::Utc::now(),
            tags: HashMap::new(),
        }
    }

    pub fn with_unit(mut self, unit: String) -> Self {
        self.unit = Some(unit);
        self
    }

    pub fn with_tag(mut self, key: String, value: String) -> Self {
        self.tags.insert(key, value);
        self
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PerformanceMetrics {
    pub startup_time_ms: Option<u64>,
    pub render_time_ms: Option<u64>,
    pub pty_response_time_ms: Option<u64>,
    pub memory_usage_mb: Option<f64>,
    pub cpu_usage_percent: Option<f64>,
    pub fps: Option<f64>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

impl Default for PerformanceMetrics {
    fn default() -> Self {
        Self {
            startup_time_ms: None,
            render_time_ms: None,
            pty_response_time_ms: None,
            memory_usage_mb: None,
            cpu_usage_percent: None,
            fps: None,
            timestamp: chrono::Utc::now(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ErrorReport {
    pub id: String,
    pub error_type: String,
    pub message: String,
    pub stack_trace: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub session_id: Option<String>,
    pub user_id: Option<String>,
    pub app_version: String,
    pub os: String,
    pub additional_data: HashMap<String, serde_json::Value>,
}

impl ErrorReport {
    pub fn new(error_type: String, message: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            error_type,
            message,
            stack_trace: None,
            timestamp: chrono::Utc::now(),
            session_id: None,
            user_id: None,
            app_version: env!("CARGO_PKG_VERSION").to_string(),
            os: std::env::consts::OS.to_string(),
            additional_data: HashMap::new(),
        }
    }

    pub fn with_stack_trace(mut self, stack_trace: String) -> Self {
        self.stack_trace = Some(stack_trace);
        self
    }

    pub fn with_session_id(mut self, session_id: String) -> Self {
        self.session_id = Some(session_id);
        self
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TelemetryConfig {
    pub enabled: bool,
    pub log_level: TelemetryEventLevel,
    pub log_to_file: bool,
    pub log_file_path: Option<String>,
    pub max_log_size_mb: usize,
    pub max_log_files: usize,
    pub send_analytics: bool,
    pub analytics_endpoint: Option<String>,
    pub error_reporting: bool,
    pub error_reporting_endpoint: Option<String>,
    pub performance_tracking: bool,
}

impl Default for TelemetryConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            log_level: TelemetryEventLevel::Info,
            log_to_file: true,
            log_file_path: Some("terminal.log".to_string()),
            max_log_size_mb: 10,
            max_log_files: 5,
            send_analytics: false,
            analytics_endpoint: None,
            error_reporting: false,
            error_reporting_endpoint: None,
            performance_tracking: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TelemetryState {
    pub config: TelemetryConfig,
    pub events: Vec<TelemetryEvent>,
    pub metrics: Vec<TelemetryMetric>,
    pub performance_metrics: PerformanceMetrics,
}

impl Default for TelemetryState {
    fn default() -> Self {
        Self {
            config: TelemetryConfig::default(),
            events: Vec::new(),
            metrics: Vec::new(),
            performance_metrics: PerformanceMetrics::default(),
        }
    }
}

impl TelemetryState {
    pub fn new(config: TelemetryConfig) -> Self {
        Self {
            config,
            events: Vec::new(),
            metrics: Vec::new(),
            performance_metrics: PerformanceMetrics::default(),
        }
    }

    pub fn add_event(&mut self, event: TelemetryEvent) {
        if self.config.enabled {
            self.events.push(event);
        }
    }

    pub fn add_metric(&mut self, metric: TelemetryMetric) {
        if self.config.enabled && self.config.performance_tracking {
            self.metrics.push(metric);
        }
    }

    pub fn clear_events(&mut self) {
        self.events.clear();
    }

    pub fn clear_metrics(&mut self) {
        self.metrics.clear();
    }

    pub fn get_events_by_type(&self, event_type: &TelemetryEventType) -> Vec<&TelemetryEvent> {
        self.events
            .iter()
            .filter(|e| &e.event_type == event_type)
            .collect()
    }

    pub fn get_events_by_level(&self, level: &TelemetryEventLevel) -> Vec<&TelemetryEvent> {
        self.events.iter().filter(|e| &e.level == level).collect()
    }

    pub fn get_errors(&self) -> Vec<&TelemetryEvent> {
        self.get_events_by_level(&TelemetryEventLevel::Error)
    }

    pub fn get_warnings(&self) -> Vec<&TelemetryEvent> {
        self.get_events_by_level(&TelemetryEventLevel::Warn)
    }
}
