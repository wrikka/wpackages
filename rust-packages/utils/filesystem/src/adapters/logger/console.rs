//! Console logger adapter

use super::structured::{StructuredLogger, LogLevel};
use std::collections::HashMap;
use chrono::Local;

/// Console logger with colored output
pub struct ConsoleLogger {
    structured: StructuredLogger,
    use_colors: bool,
}

impl ConsoleLogger {
    /// Create new console logger
    pub fn new(component: String) -> Self {
        Self {
            structured: StructuredLogger::new(component),
            use_colors: true,
        }
    }

    /// Create console logger without colors
    pub fn without_colors(component: String) -> Self {
        Self {
            structured: StructuredLogger::new(component),
            use_colors: false,
        }
    }

    /// Enable/disable colors
    pub fn with_colors(mut self, use_colors: bool) -> Self {
        self.use_colors = use_colors;
        self
    }

    /// Get color code for log level
    fn get_color_code(&self, level: LogLevel) -> &'static str {
        if !self.use_colors {
            return "";
        }

        match level {
            LogLevel::Trace => "\x1b[37m",      // White
            LogLevel::Debug => "\x1b[36m",      // Cyan
            LogLevel::Info => "\x1b[32m",       // Green
            LogLevel::Warn => "\x1b[33m",       // Yellow
            LogLevel::Error => "\x1b[31m",      // Red
        }
    }

    /// Get reset color code
    fn get_reset_code(&self) -> &'static str {
        if self.use_colors {
            "\x1b[0m"
        } else {
            ""
        }
    }

    /// Format log message for console
    fn format_message(&self, level: LogLevel, message: &str, fields: &HashMap<String, String>) -> String {
        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S");
        let color_code = self.get_color_code(level);
        let reset_code = self.get_reset_code();
        let level_str = format!("{:?}{}", level, reset_code);

        let mut formatted = format!(
            "{}{} [{}] [{}]{} {}",
            color_code,
            timestamp,
            level_str,
            self.structured.component,
            reset_code,
            message
        );

        if !fields.is_empty() {
            formatted.push_str(" | ");
            let field_strings: Vec<String> = fields
                .iter()
                .map(|(k, v)| format!("{}={}", k, v))
                .collect();
            formatted.push_str(&field_strings.join(", "));
        }

        formatted
    }

    /// Log to console
    pub fn log(&self, level: LogLevel, message: &str, fields: &HashMap<String, String>) {
        let formatted = self.format_message(level, message, fields);
        println!("{}", formatted);
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

    /// Log filesystem operation with formatted output
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
            fields.insert("duration_ms".to_string(), format!("{}ms", duration));
        }

        if let Some(err) = error {
            fields.insert("error".to_string(), err.to_string());
            self.error(&format!("❌ Filesystem operation failed: {}", operation), &fields);
        } else {
            self.info(&format!("✅ Filesystem operation completed: {}", operation), &fields);
        }
    }

    /// Log search operation with formatted output
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
        fields.insert("results".to_string(), results_count.to_string());
        fields.insert("duration".to_string(), format!("{}ms", duration_ms));

        self.info(&format!("🔍 Search completed: {} results", results_count), &fields);
    }

    /// Log navigation operation with formatted output
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

        self.info(&format!("📁 Navigation: {}", operation), &fields);
    }

    /// Print success message
    pub fn success(&self, message: &str) {
        let mut fields = HashMap::new();
        fields.insert("status".to_string(), "success".to_string());
        self.info(&format!("✅ {}", message), &fields);
    }

    /// Print warning message with icon
    pub fn warning(&self, message: &str) {
        let mut fields = HashMap::new();
        fields.insert("status".to_string(), "warning".to_string());
        self.warn(&format!("⚠️ {}", message), &fields);
    }

    /// Print error message with icon
    pub fn failure(&self, message: &str) {
        let mut fields = HashMap::new();
        fields.insert("status".to_string(), "error".to_string());
        self.error(&format!("❌ {}", message), &fields);
    }

    /// Print info message with icon
    pub fn info_icon(&self, message: &str) {
        let mut fields = HashMap::new();
        fields.insert("status".to_string(), "info".to_string());
        self.info(&format!("ℹ️ {}", message), &fields);
    }
}
