//! Structured logger adapter

use tracing::{info, warn, error, debug, trace};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Log level
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    /// Convert to tracing level
    pub fn to_tracing_level(self) -> tracing::Level {
        match self {
            LogLevel::Trace => tracing::Level::TRACE,
            LogLevel::Debug => tracing::Level::DEBUG,
            LogLevel::Info => tracing::Level::INFO,
            LogLevel::Warn => tracing::Level::WARN,
            LogLevel::Error => tracing::Level::ERROR,
        }
    }

    /// Parse from string
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "trace" => Some(LogLevel::Trace),
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        }
    }
}

/// Structured logger adapter
pub struct StructuredLogger {
    component: String,
}

impl StructuredLogger {
    /// Create a new structured logger
    pub fn new(component: String) -> Self {
        Self { component }
    }

    /// Log with structured data
    pub fn log(&self, level: LogLevel, message: &str, fields: &HashMap<String, String>) {
        let span = tracing::span!(
            level: level.to_tracing_level(),
            component = %self.component,
            "structured_log"
        );
        let _enter = span.enter();

        match level {
            LogLevel::Trace => trace!(message, ?fields),
            LogLevel::Debug => debug!(message, ?fields),
            LogLevel::Info => info!(message, ?fields),
            LogLevel::Warn => warn!(message, ?fields),
            LogLevel::Error => error!(message, ?fields),
        }
    }

    /// Log trace message
    pub fn trace(&self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Trace, message, fields);
    }

    /// Log debug message
    pub fn debug(&self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Debug, message, fields);
    }

    /// Log info message
    pub fn info(&self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Info, message, fields);
    }

    /// Log warning message
    pub fn warn(&self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Warn, message, fields);
    }

    /// Log error message
    pub fn error(&self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Error, message, fields);
    }

    /// Log filesystem operation
    pub fn log_fs_operation(
        &self,
        operation: &str,
        path: &str,
        duration_ms: Option<u64>,
        error: Option<&str>,
    ) {
        let mut fields = HashMap::new();
        fields.insert("operation".to_string(), operation.to_string());
        fields.insert("path".to_string(), path.to_string());

        if let Some(duration) = duration_ms {
            fields.insert("duration_ms".to_string(), duration.to_string());
        }

        if let Some(err) = error {
            fields.insert("error".to_string(), err.to_string());
            self.error(&format!("Filesystem operation failed: {}", operation), &fields);
        } else {
            self.info(&format!("Filesystem operation completed: {}", operation), &fields);
        }
    }

    /// Log search operation
    pub fn log_search_operation(
        &self,
        query: &str,
        path: &str,
        results_count: usize,
        duration_ms: u64,
    ) {
        let mut fields = HashMap::new();
        fields.insert("query".to_string(), query.to_string());
        fields.insert("path".to_string(), path.to_string());
        fields.insert("results_count".to_string(), results_count.to_string());
        fields.insert("duration_ms".to_string(), duration_ms.to_string());

        self.info("Search operation completed", &fields);
    }

    /// Log navigation operation
    pub fn log_navigation_operation(
        &self,
        operation: &str,
        path: &str,
        depth: Option<usize>,
    ) {
        let mut fields = HashMap::new();
        fields.insert("operation".to_string(), operation.to_string());
        fields.insert("path".to_string(), path.to_string());

        if let Some(d) = depth {
            fields.insert("depth".to_string(), d.to_string());
        }

        self.info(&format!("Navigation operation: {}", operation), &fields);
    }
}

/// Global logger factory
pub struct LoggerFactory;

impl LoggerFactory {
    /// Create logger for component
    pub fn create(component: &str) -> StructuredLogger {
        StructuredLogger::new(component.to_string())
    }

    /// Create logger with prefix
    pub fn create_with_prefix(prefix: &str, component: &str) -> StructuredLogger {
        StructuredLogger::new(format!("{}::{}", prefix, component))
    }
}
