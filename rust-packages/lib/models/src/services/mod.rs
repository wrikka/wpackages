//! Services - Effect Layer
//!
//! This module contains services for I/O operations.

pub mod analytics;
pub mod budget_manager;
pub mod cache;
pub mod cost_tracker;
pub mod fallback;
pub mod middleware;
pub mod moderation_middleware;
pub mod rate_limiter;
pub mod registry;
pub mod retry;
pub mod strategy;
pub mod capabilities;

// Re-exports
pub use analytics::AnalyticsService;
pub use budget_manager::{BudgetConfig, BudgetManager, BudgetStatus};
pub use cache::{ResponseCache};
pub use cost_tracker::{CostRecord, CostTracker};
pub use fallback::{FallbackConfig, FallbackManager};
pub use middleware::{MiddlewareManager, RequestMiddleware, ResponseMiddleware};
pub use moderation_middleware::ModerationMiddleware;
pub use rate_limiter::{RateLimitConfig, RateLimiter};
pub use registry::{
    create_default_registry, BoxedChatModel, BoxedCompletionModel, BoxedEmbeddingsModel,
    ModelRegistry,
};
pub use retry::{retry_with_backoff, RetryConfig};
pub use strategy::{StrategyConfig, StrategyManager, StrategyType};
