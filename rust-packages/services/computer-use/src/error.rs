//! Error types for computer-use
//!
//! This module provides a comprehensive error hierarchy following Rust best practices.

use std::path::PathBuf;
use thiserror::Error;

/// Result type alias for computer-use operations
pub type Result<T> = std::result::Result<T, Error>;

/// Main error type for computer-use
#[derive(Error, Debug)]
pub enum Error {
    // IPC & Communication
    #[error("IPC connection error: {0}")]
    IpcConnection(String),

    #[error("IPC bind error: {0}")]
    IpcBind(String),

    #[error("Protocol error: {0}")]
    Protocol(String),

    #[error("Message encoding error: {0}")]
    Encoding(String),

    #[error("Message decoding error: {0}")]
    Decoding(String),

    // Desktop Automation
    #[error("Desktop automation error: {0}")]
    Automation(String),

    #[error("Computer error: {0}")]
    Computer(String),

    #[error("Mouse control error: {0}")]
    MouseControl(String),

    #[error("Keyboard control error: {0}")]
    KeyboardControl(String),

    #[error("Screenshot capture error: {0}")]
    Screenshot(String),

    #[error("Clipboard operation error: {0}")]
    Clipboard(String),

    // Vision & Detection
    #[error("Vision error: {0}")]
    Vision(String),

    #[error("OCR error: {0}")]
    Ocr(String),

    #[error("Visual search error: {0}")]
    VisualSearch(String),

    #[error("Element not found: {selector}")]
    ElementNotFound { selector: String },

    // Window Management
    #[error("Window not found: {selector}")]
    WindowNotFound { selector: String },

    #[error("Window operation failed: {0}")]
    WindowOperation(String),

    // Process Management
    #[error("Process not found: {0}")]
    ProcessNotFound(String),

    #[error("Process operation failed: {0}")]
    ProcessOperation(String),

    // Session & Daemon
    #[error("Daemon not running")]
    DaemonNotRunning,

    #[error("Session error: {0}")]
    Session(String),

    #[error("Session not found: {session_id}")]
    SessionNotFound { session_id: String },

    // Command & Selector
    #[error("Invalid command: {0}")]
    InvalidCommand(String),

    #[error("Invalid selector: {0}")]
    InvalidSelector(String),

    #[error("Invalid argument: {0}")]
    InvalidArgument(String),

    // Configuration
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Configuration file not found: {path}")]
    ConfigNotFound { path: PathBuf },

    // Memory & Storage
    #[error("Memory error: {0}")]
    Memory(String),

    #[error("Storage error: {0}")]
    Storage(String),

    // Safety & Security
    #[error("Safety violation: {0}")]
    SafetyViolation(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error("Sandbox violation: {0}")]
    SandboxViolation(String),

    // Recording
    #[error("Recording error: {0}")]
    Recording(String),

    #[error("No active recording")]
    NoActiveRecording,

    // IO & System
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Timeout after {seconds} seconds")]
    Timeout { seconds: u64 },

    #[error("Cancelled")]
    Cancelled,

    // Generic
    #[error("Internal error: {0}")]
    Internal(String),
}

impl Error {
    /// Check if error is recoverable
    pub const fn is_recoverable(&self) -> bool {
        matches!(
            self,
            Error::ElementNotFound { .. }
                | Error::WindowNotFound { .. }
                | Error::Timeout { .. }
                | Error::DaemonNotRunning
        )
    }

    /// Check if error requires user intervention
    pub const fn requires_intervention(&self) -> bool {
        matches!(
            self,
            Error::SafetyViolation(_)
                | Error::PermissionDenied(_)
                | Error::SandboxViolation(_)
        )
    }

    /// Get error category for logging
    pub const fn category(&self) -> &'static str {
        match self {
            Error::IpcConnection(_)
            | Error::IpcBind(_)
            | Error::Protocol(_)
            | Error::Encoding(_)
            | Error::Decoding(_) => "ipc",

            Error::Automation(_)
            | Error::MouseControl(_)
            | Error::KeyboardControl(_)
            | Error::Screenshot(_)
            | Error::Clipboard(_) => "automation",

            Error::Vision(_)
            | Error::Ocr(_)
            | Error::VisualSearch(_)
            | Error::ElementNotFound { .. } => "vision",

            Error::WindowNotFound { .. } | Error::WindowOperation(_) => "window",

            Error::ProcessNotFound(_) | Error::ProcessOperation(_) => "process",

            Error::DaemonNotRunning | Error::Session(_) | Error::SessionNotFound { .. } => {
                "session"
            }

            Error::InvalidCommand(_)
            | Error::InvalidSelector(_)
            | Error::InvalidArgument(_) => "command",

            Error::Config(_) | Error::ConfigNotFound { .. } => "config",

            Error::Memory(_) | Error::Storage(_) => "storage",

            Error::SafetyViolation(_)
            | Error::PermissionDenied(_)
            | Error::SandboxViolation(_) => "safety",

            Error::Recording(_) | Error::NoActiveRecording => "recording",

            Error::Io(_)
            | Error::Serialization(_)
            | Error::Parse(_)
            | Error::Timeout { .. }
            | Error::Cancelled
            | Error::Internal(_) => "system",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_category() {
        let err = Error::ElementNotFound {
            selector: "test".to_string(),
        };
        assert_eq!(err.category(), "vision");
    }

    #[test]
    fn test_is_recoverable() {
        let err = Error::Timeout { seconds: 10 };
        assert!(err.is_recoverable());

        let err = Error::SafetyViolation("test".to_string());
        assert!(!err.is_recoverable());
    }

    #[test]
    fn test_requires_intervention() {
        let err = Error::PermissionDenied("test".to_string());
        assert!(err.requires_intervention());

        let err = Error::Timeout { seconds: 10 };
        assert!(!err.requires_intervention());
    }
}
