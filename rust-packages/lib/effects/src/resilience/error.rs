//! Unified error types for resilience patterns

use thiserror::Error;

/// Unified error type for all resilience patterns
#[derive(Error, Debug)]
pub enum ResilienceError {
    // Batch operation errors
    #[error("Batch size exceeded: {size} (max: {max})")]
    BatchSizeExceeded { size: usize, max: usize },

    #[error("Operation failed: {0}")]
    OperationFailed(String),

    // Circuit breaker errors
    #[error("Circuit breaker is open")]
    CircuitBreakerOpen,

    #[error("Circuit state transition failed: {from:?} -> {to:?}")]
    StateTransitionFailed { from: String, to: String },

    #[error("Service unavailable: {0}")]
    ServiceUnavailable(String),

    #[error("Retry exhausted after {attempts} attempts")]
    RetryExhausted { attempts: u32 },

    // Rate limiting errors
    #[error("Rate limit exceeded for key: {key}")]
    RateLimitExceeded { key: String },

    #[error("Redis connection error: {0}")]
    RedisError(String),

    // Common errors
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Queue is full")]
    QueueFull,

    #[error("Timeout exceeded")]
    Timeout,

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, ResilienceError>;
