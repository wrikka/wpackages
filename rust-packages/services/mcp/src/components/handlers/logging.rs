use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

#[derive(Debug, Clone, PartialEq)]
pub enum LogLevel {
    Debug,
    Info,
    Notice,
    Warning,
    Error,
    Critical,
    Alert,
    Emergency,
}

impl LogLevel {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "notice" => Some(LogLevel::Notice),
            "warning" => Some(LogLevel::Warning),
            "error" => Some(LogLevel::Error),
            "critical" => Some(LogLevel::Critical),
            "alert" => Some(LogLevel::Alert),
            "emergency" => Some(LogLevel::Emergency),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            LogLevel::Debug => "debug",
            LogLevel::Info => "info",
            LogLevel::Notice => "notice",
            LogLevel::Warning => "warning",
            LogLevel::Error => "error",
            LogLevel::Critical => "critical",
            LogLevel::Alert => "alert",
            LogLevel::Emergency => "emergency",
        }
    }
}

pub struct LoggingHandler {
    level: LogLevel,
}

impl LoggingHandler {
    pub fn new() -> Self {
        Self {
            level: LogLevel::Info,
        }
    }

    pub fn set_level(&mut self, level: LogLevel, request_id: Id) -> Result<Response> {
        self.level = level;
        Ok(Response::success(request_id, json!({})))
    }

    pub fn get_level(&self) -> &LogLevel {
        &self.level
    }

    pub fn create_log_notification(&self, level: LogLevel, message: String) -> crate::types::protocol::Notification {
        crate::types::protocol::Notification {
            jsonrpc: "2.0".to_string(),
            method: "notifications/message".to_string(),
            params: Some(json!({
                "level": level.as_str(),
                "logger": "mcp",
                "data": message,
            })),
        }
    }
}

impl Default for LoggingHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_level() {
        let mut handler = LoggingHandler::new();
        handler.set_level(LogLevel::Debug, Id::Num(1)).unwrap();
        assert_eq!(handler.get_level(), &LogLevel::Debug);
    }

    #[test]
    fn test_log_level_from_str() {
        assert_eq!(LogLevel::from_str("debug"), Some(LogLevel::Debug));
        assert_eq!(LogLevel::from_str("info"), Some(LogLevel::Info));
        assert_eq!(LogLevel::from_str("invalid"), None);
    }
}
