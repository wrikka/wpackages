//! # Effect Logging
//!
//! Structured logging support for effect execution.
//!
//! ## Features
//!
//! - **Structured logs** - Log with structured data
//! - **Log levels** - Debug, Info, Warn, Error
//! - **Contextual information** - Log with context
//! - **Error logging** - Log errors with details
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::logging::{Logging, LogLevel};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = Effect::success(42)
//!         .with_logging(LogLevel::Info);
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

use std::fmt;
use tracing::Level;

/// Log level for effect execution.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogLevel {
    /// Debug level - detailed information for debugging.
    Debug,
    /// Info level - general informational messages.
    Info,
    /// Warn level - warning messages.
    Warn,
    /// Error level - error messages.
    Error,
}

impl fmt::Display for LogLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LogLevel::Debug => write!(f, "DEBUG"),
            LogLevel::Info => write!(f, "INFO"),
            LogLevel::Warn => write!(f, "WARN"),
            LogLevel::Error => write!(f, "ERROR"),
        }
    }
}

impl From<LogLevel> for Level {
    fn from(level: LogLevel) -> Self {
        match level {
            LogLevel::Debug => Level::DEBUG,
            LogLevel::Info => Level::INFO,
            LogLevel::Warn => Level::WARN,
            LogLevel::Error => Level::ERROR,
        }
    }
}

/// A trait for adding logging instrumentation to an effect.
pub trait Logging<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + 'static,
{
    /// Enable logging for this effect at the specified level.
    ///
    /// This will create a `tracing` span that records the execution of the effect.
    fn with_logging(self, level: LogLevel) -> Self;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_log_level_display() {
        assert_eq!(LogLevel::Debug.to_string(), "DEBUG");
        assert_eq!(LogLevel::Info.to_string(), "INFO");
        assert_eq!(LogLevel::Warn.to_string(), "WARN");
        assert_eq!(LogLevel::Error.to_string(), "ERROR");
    }

    #[test]
    fn test_log_level_to_level() {
        assert_eq!(Level::from(LogLevel::Debug), Level::DEBUG);
        assert_eq!(Level::from(LogLevel::Info), Level::INFO);
        assert_eq!(Level::from(LogLevel::Warn), Level::WARN);
        assert_eq!(Level::from(LogLevel::Error), Level::ERROR);
    }

    #[test]
    fn test_logging_config_default() {
        let config = LoggingConfig::default();
        assert_eq!(config.level, LogLevel::Info);
        assert!(config.log_execution_time);
        assert!(config.log_errors);
        assert!(!config.log_success);
    }

    #[test]
    fn test_logging_config_builders() {
        let config = LoggingConfig::new()
            .with_level(LogLevel::Debug)
            .with_execution_time(false)
            .with_errors(false)
            .with_success(true);

        assert_eq!(config.level, LogLevel::Debug);
        assert!(!config.log_execution_time);
        assert!(!config.log_errors);
        assert!(config.log_success);
    }
}
