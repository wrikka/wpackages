//! Global logger factory

/// Global logger factory
pub struct LoggerFactory;

impl LoggerFactory {
    /// Create logger for component
    pub fn create(component: &str) -> super::logger::Logger {
        super::logger::Logger::new(component.to_string())
    }

    /// Create logger with prefix
    pub fn create_with_prefix(prefix: &str, component: &str) -> super::logger::Logger {
        super::logger::Logger::new(format!("{}::{}", prefix, component))
    }
}
