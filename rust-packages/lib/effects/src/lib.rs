//! # Effect
//!
//! Effect system for Rust, inspired by Effect TS.
//!
//! ## Features
//!
//! - **Zero-cost abstractions**: Effects are just functions, no heap allocation
//! - **Composable**: Chain operations with `map`, `flatMap`, `bind`
//! - **Context-aware**: Dependency injection through typed contexts
//! - **Async support**: Both sync and async effects
//! - **Type-safe**: Compile-time guarantees for effects
//! - **Resilience patterns**: Circuit breaker, rate limiting, batch operations
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = Effect::success(42)
//!         .map(|x| x * 2)
//!         .flat_map(|x| Effect::success(x + 10));
//!
//!     let result = runtime.run(effect).await?;
//!     println!("Result: {}", result);
//!
//!     Ok(())
//! }
//! ```

pub mod macros;
pub mod prelude;

pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod error_legacy;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

/// Resilience patterns (circuit breaker, rate limiting, batch operations)
pub mod resilience;

pub use error::{EffectError, EffectResult};
pub use services::Runtime;
pub use types::{Context, Effect, Either, OptionEffect};
pub use utils::{all, race};
pub use app::App;

// Re-export resilience types for convenience
pub use resilience::{
    BatchItem, BatchResult, BatchStats, CallResult, CircuitState, CircuitStats,
    RateLimitResult, RateLimitStatus, RequestKey,
    CircuitBreakerState, DefaultCircuitBreaker, SimpleBatchProcessor, TokenBucketLimiter, TokenBucketState,
    BatchProcessor, CircuitBreaker, ExponentialBackoffRetry,
    InMemoryQueue, InMemoryStorage, Queue, RateLimiter, RetryPolicy, Storage, TokenBucketStorage,
    ResilienceError,
};

