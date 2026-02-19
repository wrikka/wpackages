//! Prelude module for convenient imports
//!
//! Import this module to get all essential types and traits:
//!
//! ```rust,no_run
//! use task::prelude::*;
//! ```

pub use crate::config::Config;
pub use crate::error::{TaskError, Result};
pub use crate::components::types::*;
pub use crate::components::retry::{RetryPolicy, BackoffStrategy};
pub use crate::components::cron::{CronScheduler, validate_cron_expression, compute_next_schedule};
pub use crate::components::cancellation::{CancellationManager, CancellationService};
pub use crate::components::priority_queue::{TaskPriorityQueue, QueueStats};
pub use crate::components::rate_limit::{RateLimiter, RateLimitingMiddleware, RateLimitStats};
pub use crate::components::deduplication::{TaskDeduplicator, DeduplicationService, DeduplicationStrategy, DeduplicationConfig};
pub use crate::components::middleware::{Middleware, MiddlewareChain, LoggingMiddleware, RetryMiddleware, TimeoutMiddleware};
#[cfg(feature = "metrics")]
pub use crate::components::middleware::MetricsMiddleware;
pub use crate::components::dependencies::{DependencyManager, DependencyGraph, TaskChain, TaskDependency, DependencyType};
pub use crate::services::executor::TaskExecutor;
pub use crate::services::store::TaskStore;
pub use crate::adapters::store_sqlite::SQLiteTaskStore;
#[cfg(feature = "postgres")]
pub use crate::adapters::store_postgres::PostgresTaskStore;
#[cfg(feature = "mysql")]
pub use crate::adapters::store_mysql::MySQLTaskStore;
#[cfg(feature = "redis")]
pub use crate::adapters::store_redis::RedisTaskStore;
#[cfg(feature = "distributed")]
pub use crate::services::distributed::DistributedExecutor;
