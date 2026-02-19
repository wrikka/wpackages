//! File logger adapter

use super::structured::{StructuredLogger, LogLevel};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use chrono::Local;

/// File logger with rotation support
pub struct FileLogger {
    structured: StructuredLogger,
    file_path: String,
    max_file_size: u64,
    current_size: u64,
}

impl FileLogger {
    /// Create new file logger
    pub fn new(component: String, file_path: String) -> Self {
        Self {
            structured: StructuredLogger::new(component),
            file_path,
            max_file_size: 10 * 1024 * 1024, // 10MB
            current_size: 0,
        }
    }

    /// Set maximum file size before rotation
    pub fn with_max_file_size(mut self, max_size: u64) -> Self {
        self.max_file_size = max_size;
        self
    }

    /// Get current file size
    fn get_current_file_size(&self) -> std::io::Result<u64> {
        match std::fs::metadata(&self.file_path) {
            Ok(metadata) => Ok(metadata.len()),
            Err(_) => Ok(0),
        }
    }

    /// Rotate log file if needed
    fn rotate_if_needed(&mut self) -> std::io::Result<()> {
        self.current_size = self.get_current_file_size()?;
        
        if self.current_size >= self.max_file_size {
            let timestamp = Local::now().format("%Y%m%d_%H%M%S");
            let rotated_path = format!("{}.{}", self.file_path, timestamp);
            
            if let Err(e) = std::fs::rename(&self.file_path, &rotated_path) {
                eprintln!("Failed to rotate log file: {}", e);
            }
            
            self.current_size = 0;
        }
        
        Ok(())
    }

    /// Format log entry as JSON
    fn format_log_entry(&self, level: LogLevel, message: &str, fields: &HashMap<String, String>) -> String {
        let timestamp = Local::now().to_rfc3339();
        let mut log_entry = serde_json::json!({
            "timestamp": timestamp,
            "level": format!("{:?}", level),
            "component": self.structured.component,
            "message": message,
            "fields": fields
        });

        // Add filesystem-specific fields
        if fields.contains_key("operation") {
            log_entry["operation_type"] = serde_json::Value::String("filesystem".to_string());
        }

        log_entry.to_string()
    }

    /// Write log entry to file
    fn write_log_entry(&mut self, entry: &str) -> std::io::Result<()> {
        self.rotate_if_needed()?;

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.file_path)?;

        writeln!(file, "{}", entry)?;
        file.flush()?;

        self.current_size += entry.len() as u64 + 1; // +1 for newline
        Ok(())
    }

    /// Log to file
    pub fn log(&mut self, level: LogLevel, message: &str, fields: &HashMap<String, String>) {
        let entry = self.format_log_entry(level, message, fields);
        
        if let Err(e) = self.write_log_entry(&entry) {
            eprintln!("Failed to write log entry: {}", e);
        }
    }

    /// Log trace message
    pub fn trace(&mut self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Trace, message, fields);
    }

    /// Log debug message
    pub fn debug(&mut self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Debug, message, fields);
    }

    /// Log info message
    pub fn info(&mut self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Info, message, fields);
    }

    /// Log warning message
    pub fn warn(&mut self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Warn, message, fields);
    }

    /// Log error message
    pub fn error(&mut self, message: &str, fields: &HashMap<String, String>) {
        self.log(LogLevel::Error, message, fields);
    }

    /// Log filesystem operation with structured data
    pub fn log_fs_operation(
        &mut self,
        operation: &str,
        path: &str,
        duration_ms: Option<u64>,
        error: Option<&str>,
    ) {
        let mut fields = HashMap::new();
        fields.insert("operation".to_string(), operation.to_string());
        fields.insert("path".to_string(), path.to_string());
        fields.insert("type".to_string(), "filesystem".to_string());

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

    /// Log search operation with structured data
    pub fn log_search_operation(
        &mut self,
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
        fields.insert("type".to_string(), "search".to_string());

        self.info("Search operation completed", &fields);
    }

    /// Log navigation operation with structured data
    pub fn log_navigation_operation(
        &mut self,
        operation: &str,
        path: &str,
        depth: Option<usize>,
    ) {
        let mut fields = HashMap::new();
        fields.insert("operation".to_string(), operation.to_string());
        fields.insert("path".to_string(), path.to_string());
        fields.insert("type".to_string(), "navigation".to_string());

        if let Some(d) = depth {
            fields.insert("depth".to_string(), d.to_string());
        }

        self.info(&format!("Navigation operation: {}", operation), &fields);
    }

    /// Flush log file
    pub fn flush(&mut self) -> std::io::Result<()> {
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.file_path)?;
        
        file.flush()
    }
}
