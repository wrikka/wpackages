//! Resilience patterns for Effect system
//!
//! This module provides resilience patterns integrated with the Effect system:
//! - **Batch Operations**: Process multiple items efficiently
//! - **Circuit Breaker**: Prevent cascading failures
//! - **Rate Limiting**: Control request rates

pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

// Re-exports
pub use app::ResilienceApp;
pub use error::{ResilienceError, Result};

pub use types::{
    BatchItem, BatchResult, BatchStats, CallResult, CircuitState, CircuitStats, RateLimitResult,
    RateLimitStatus, RequestKey,
};

pub use components::{
    CircuitBreakerState, DefaultCircuitBreaker, SimpleBatchProcessor, TokenBucketLimiter,
    TokenBucketState,
};

pub use services::{
    BatchProcessor, CircuitBreaker, ExponentialBackoffRetry, InMemoryQueue, InMemoryStorage, Queue,
    RateLimiter, RetryPolicy, Storage, TokenBucketStorage,
};

pub mod prelude {
    //! Prelude module for convenient imports

    pub use crate::resilience::app::ResilienceApp;
    pub use crate::resilience::components::{
        CircuitBreakerState, DefaultCircuitBreaker, SimpleBatchProcessor, TokenBucketLimiter,
        TokenBucketState,
    };
    pub use crate::resilience::error::{ResilienceError, Result};
    pub use crate::resilience::services::{
        BatchProcessor, CircuitBreaker, ExponentialBackoffRetry, InMemoryQueue, InMemoryStorage,
        Queue, RateLimiter, RetryPolicy, Storage, TokenBucketStorage,
    };
    pub use crate::resilience::types::{
        BatchItem, BatchResult, BatchStats, CallResult, CircuitState, CircuitStats,
        RateLimitResult, RateLimitStatus, RequestKey,
    };
}
