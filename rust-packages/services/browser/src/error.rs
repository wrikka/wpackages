//! Error types for browser-use crate.

use thiserror::Error;

/// Result type alias for this crate.
pub type Result<T> = std::result::Result<T, Error>;

/// Error type for browser-use operations.
#[derive(Error, Debug)]
pub enum Error {
    // === Browser & Navigation Errors ===
    /// Browser interaction failed
    #[error("Browser error: {0}")]
    Browser(String),

    /// Navigation failed
    #[error("Navigation failed: {0}")]
    Navigation(String),

    /// Element not found
    #[error("Element not found: {0}")]
    ElementNotFound(String),

    /// No active page
    #[error("No active page")]
    NoPage,

    /// No snapshot available
    #[error("No snapshot available")]
    NoSnapshot,

    /// Action failed on element
    #[error("Action failed on element '{selector}': {reason}")]
    Action {
        selector: String,
        reason: String,
    },

    // === Session & Daemon Errors ===
    /// Session not found
    #[error("Session not found: {0}")]
    SessionNotFound(String),

    /// Daemon not running
    #[error("Daemon not running: {0}")]
    DaemonNotRunning(String),

    /// Daemon error
    #[error("Daemon error: {0}")]
    Daemon(String),

    // === Protocol & IPC Errors ===
    /// IPC error
    #[error("IPC error: {0}")]
    Ipc(String),

    /// Protocol error
    #[error("Protocol error: {0}")]
    Protocol(String),

    /// Invalid command
    #[error("Invalid command: {0}")]
    InvalidCommand(String),

    // === Operation Errors ===
    /// Timeout waiting for condition
    #[error("Timeout waiting for: {0}")]
    Timeout(String),

    /// Validation failed
    #[error("Validation failed: {0}")]
    Validation(String),

    /// Extraction failed
    #[error("Extraction failed: {0}")]
    Extraction(String),

    /// Content extraction failed
    #[error("Content extraction failed: {0}")]
    ContentExtraction(String),

    /// Workflow error
    #[error("Workflow error: {0}")]
    Workflow(String),

    // === Feature Errors ===
    /// Browser type not supported
    #[error("Browser type not supported: {0}")]
    BrowserTypeNotSupported(String),

    /// Visual regression error
    #[error("Visual regression error: {0}")]
    VisualRegression(String),

    /// AI vision error
    #[error("AI vision error: {0}")]
    AIVision(String),

    /// JavaScript execution error
    #[error("JavaScript error: {0}")]
    JavaScript(String),

    // === External Errors ===
    /// I/O error
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    /// Serialization error
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    /// Metrics error
    #[error("Metrics error: {0}")]
    Metrics(String),

    /// Chromium error
    #[error("Chromium error: {0}")]
    Chromium(String),

    /// CDP protocol error
    #[error("CDP error: {0}")]
    Cdp(String),

    // === Generic Errors ===
    /// Other error
    #[error("{0}")]
    Other(String),
}
