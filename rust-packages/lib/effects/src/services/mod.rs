//! Services module - organized by functionality
//!
//! This module provides various services for effect composition, resilience,
//! observability, and utilities.

// Core Services
pub mod builders;
pub mod composition;
pub mod runtime;

// Resilience & Reliability
pub mod adaptive_retry;
pub mod bulkhead;
pub mod cache_effects;
pub mod cache_ttl;
pub mod fallback;
pub mod load_shed;
pub mod memoization;
pub mod resilience_effects;
pub mod timeout;

// Concurrency & Parallelism
pub mod async_effects;
pub mod batching;
pub mod concurrency;
pub mod debounce;
pub mod parallel_effects;

// Observability & Debugging
pub mod assertions;
pub mod distributed_tracing;
pub mod error_context;
pub mod error_recovery;
pub mod logging;
pub mod metrics;
pub mod performance;
pub mod replay;
pub mod structured_errors;
pub mod tracing;
pub mod visualization;

// Event Sourcing & Sagas
pub mod dlq;
pub mod ecosystem;
pub mod event_sourcing;
pub mod saga;

// Testing & Development
pub mod conditional;
pub mod health_check;
pub mod hot_reload;
pub mod idempotency;
pub mod mocking;
pub mod property_testing;
pub mod sandbox;
pub mod shadow;
pub mod validation;

// Re-exports organized by category

// Core
pub use builders::{BuilderSupport, EffectBuilder};
pub use composition::EffectComposer;
pub use runtime::Runtime;

// Resilience
pub use adaptive_retry::{AdaptiveRetryConfig, AdaptiveRetryExt, RetryStrategy};
pub use bulkhead::{BulkheadConfig, BulkheadExt, BulkheadRegistry, BulkheadWaitExt};
pub use cache_ttl::{CacheConfig, CacheExt, CacheRefreshExt, TtlCache};
pub use fallback::{ConditionalFallbackExt, FallbackConfig, FallbackErrorStrategy, FallbackExt, LazyFallbackExt};
pub use load_shed::{LoadShedConfig, LoadShedExt, LoadShedder};
pub use memoization::{MemoCache, MemoExt};
pub use timeout::{CancellationToken, CancellableExt, DeadlineExt, TimeoutConfig, TimeoutExt};

// Concurrency
pub use batching::{BatchConfig, BatchProcessor, WindowConfig, WindowedProcessor};
pub use concurrency::{ConcurrencyConfig, ConcurrencyExt, KeyedConcurrencyExt, KeyedConcurrencyLimiter};
pub use debounce::{DebounceConfig, DebounceExt, DebounceRegistry, ThrottleConfig, ThrottleExt, ThrottleRegistry};

// Observability
pub use assertions::EffectAssertions;
pub use distributed_tracing::{ConsoleSpanExporter, DistributedTracingExt, Span, SpanContext, SpanExporter, SpanStatus, Tracer};
pub use error_context::ErrorContextExt;
pub use error_recovery::ErrorRecovery;
pub use logging::LogLevel;
pub use metrics::{record_effect_completion, record_effect_start};
pub use performance::PerformanceMonitoring;
pub use replay::{DebugConfig, DebugExt, RecordingStore, ReplayConfig, ReplayableExt};
pub use structured_errors::{StructuredError, StructuredErrorExt};
pub use tracing::Tracing;
pub use validation::{Constraints, JsonSchemaValidator, SchemaValidator, ValidationExt, ValidationResult};
pub use visualization::{EffectEdge, EffectGraph, EffectNode, EdgeType, GraphExt};

// Event Sourcing & Sagas
pub use dlq::{DeadLetterQueue, DlqExt, DlqProcessor};
pub use ecosystem::{EffectEcosystem, EffectPattern};
pub use event_sourcing::{EffectEvent, EventSourcingConfig, EventSourcingExt, EventStore, InMemoryEventStore};
pub use saga::{SagaBuilder, SagaCoordinator, SagaOrchestrator, SagaResult, SagaStatus, SagaStep};

// Development & Testing
pub use conditional::{ConditionalExt, FeatureFlagStore};
pub use health_check::{HealthCheck, HealthCheckExt, HealthCheckRegistry, HealthStatus};
pub use hot_reload::{ConfigChange, ConfigStore, HotReloadConfig, HotReloadExt};
pub use idempotency::{IdempotencyConfig, IdempotencyExt, IdempotencyStore};
pub use mocking::Mock;
pub use property_testing::{Arbitrary, FuzzConfig, FuzzTestExt, PropertyTestConfig, PropertyTestExt, PropertyTestResult};
pub use sandbox::{SandboxConfig, SandboxExt};
pub use shadow::{ShadowConfig, ShadowExt, ShadowMetrics};
