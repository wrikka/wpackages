//! # Error Handling
//!
//! Custom error types for the AI TUI application.
//!
//! This module defines all possible error types that can occur in the application,
//! using `thiserror` for clean error messages and automatic conversions.

use thiserror::Error;

/// Application error type
#[derive(Error, Debug)]
pub enum AppError {
    /// Configuration error from figment
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    /// IO error from filesystem operations
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    /// Generic service error
    #[error("Service error: {0}")]
    Service(String),

    /// Invalid input from user
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    /// Resource not found
    #[error("Not found: {0}")]
    NotFound(String),

    /// Internal application error
    #[error("Internal error: {0}")]
    Internal(String),
    // AI SDK error (disabled until properly configured)
    // #[error("AI SDK error: {0}")]
    // AISDK(#[from] aisdk::error::Error),
}

/// Result type alias for AppError
pub type Result<T> = std::result::Result<T, AppError>;

impl AppError {
    /// Create an IO error with the given source.
    #[must_use]
    pub fn io(source: std::io::Error) -> Self {
        Self::Io(source)
    }

    /// Create a service error with the given message.
    #[must_use]
    pub fn service(msg: impl Into<String>) -> Self {
        Self::Service(msg.into())
    }

    /// Create an invalid input error with the given message.
    #[must_use]
    pub fn invalid_input(msg: impl Into<String>) -> Self {
        Self::InvalidInput(msg.into())
    }

    /// Create a not found error with the given message.
    #[must_use]
    pub fn not_found(msg: impl Into<String>) -> Self {
        Self::NotFound(msg.into())
    }

    /// Create an internal error with the given message.
    #[must_use]
    pub fn internal(msg: impl Into<String>) -> Self {
        Self::Internal(msg.into())
    }

    /// Create a validation error with the given message.
    #[must_use]
    pub fn validation(msg: impl Into<String>) -> Self {
        Self::InvalidInput(format!("Validation failed: {}", msg.into()))
    }
}
