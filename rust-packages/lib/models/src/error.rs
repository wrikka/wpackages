//! Error types for AI Models library
//!
//! This module defines all error types used throughout the application.

use thiserror::Error;

/// Main error type for AI Models library
#[derive(Error, Debug)]
pub enum AiModelsError {
    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    /// Model not found
    #[error("Model not found: {model_name}")]
    ModelNotFound { model_name: String },

    /// Provider error
    #[error("Provider error: {provider}")]
    ProviderError {
        provider: String,
        #[source]
        source: anyhow::Error,
    },

    /// Network error
    #[error("Network error: {0}")]
    NetworkError(String),

    /// Reqwest error (wrapped)
    #[error(transparent)]
    ReqwestError(#[from] reqwest::Error),

    /// Serde JSON error (wrapped)
    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    /// Serialization error
    #[error("Serialization error: {0}")]
    Serialization(String),

    /// Timeout error
    #[error("Operation timed out after {seconds} seconds")]
    Timeout { seconds: u64 },

    /// Invalid input
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    /// Rate limit exceeded
    #[error("Rate limit exceeded: {limit} requests per {window}")]
    RateLimitExceeded { limit: u32, window: String },

    /// API error
    #[error("API error (status {status}): {message}")]
    ApiError { status: u16, message: String },

    /// Authentication error
    #[error("Authentication failed for provider: {provider}")]
    AuthenticationError { provider: String },

    /// Quota exceeded
    #[error("Quota exceeded for provider: {provider}")]
    QuotaExceeded { provider: String },

    /// Unsupported operation
    #[error("Unsupported operation: {operation} for model: {model}")]
    UnsupportedOperation { operation: String, model: String },

    /// Stream error
    #[error("Stream error: {0}")]
    StreamError(String),

    /// Cache error
    #[error("Cache error: {0}")]
    CacheError(String),

    /// Retry exhausted
    #[error("Retry exhausted after {attempts} attempts")]
    RetryExhausted { attempts: u32 },

    /// IO error
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

/// Result type alias for convenience
pub type Result<T> = std::result::Result<T, AiModelsError>;
