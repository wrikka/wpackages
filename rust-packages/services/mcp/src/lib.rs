pub mod error;
pub mod config;
pub mod telemetry;

pub mod types;
pub mod components;
pub mod services;

pub mod app;
pub mod prelude;

pub use error::{McpError, Result};
pub use config::McpConfig;

pub use types::protocol::{JsonRpcMessage, Request, Response, Notification, Id, Error as ProtocolError};
pub use components::protocol::ProtocolHandler;
pub use services::transports::stdio::{StdioTransport, run_stdio_transport};
pub use services::transports::websocket::WebSocketTransport;

pub use app::McpApp;
pub use services::api::McpServer;

pub use components::handlers::{
    ResourceHandler, ToolHandler, PromptHandler,
    TaskHandler, Task, TaskStatus,
    CompletionHandler, LoggingHandler, LogLevel,
    RootsHandler, Root, ProgressHandler, Progress,
    SamplingHandler, ElicitationHandler, FormField
};

// Resilience
pub use services::resilience::{CircuitBreaker, CircuitState, CircuitBreakerConfig, RetryPolicy, RetryConfig, HealthChecker, HealthStatus, HealthConfig};
// Observability
pub use services::observability::{init_logging, LogLevel as LogLevelConfig, LogConfig, MetricsCollector, MetricType, MetricValue, init_tracing, TracingConfig};
// CLI Tools
pub use services::cli::{scaffold_project, ProjectType, ScaffoldConfig, generate_server_stub, generate_client_stub, create_mock_server, create_mock_client};
// Batch Operations
pub use services::batch::{BatchOperation, BatchRequest, BatchResponse, BatchExecutor, Transaction, TransactionState, TransactionConfig};
// Bidirectional Communication
pub use services::bidirectional::{BidirectionalChannel, ChannelConfig, MessageDirection, Event, EventHandler, EventBus, EventSubscription, EventStream, StreamConfig};
// Schema Introspection
pub use services::introspection::{SchemaIntrospector, SchemaInfo, SchemaType, Capabilities, Capability, ServerInfo, DiscoveryService, DiscoveryConfig};
// Completion API
pub use services::completion::{CompletionApi, CompletionRequest, CompletionResponse, CompletionItem, SuggestionEngine, SuggestionType, Suggestion, CompletionContext, ContextExtractor};
pub use services::completion::api::CompletionItemKind;
// Plugin System
pub use services::plugins::{PluginLoader, PluginConfig, PluginMetadata, PluginRegistry, PluginInstance, Sandbox, SandboxConfig, ResourceLimits};
pub use services::plugins::registry::PluginState;
// Advanced Transport Features
pub use services::transports::advanced::{Http2Transport, Http2Config, CompressionLayer, CompressionType, CompressionConfig, ConnectionPool, PoolConfig, PooledConnection, TlsConfig, TlsLayer, CertificateConfig};
// Resource Templates
pub use services::templates::{ResourceTemplate, TemplateVariable, TemplatePattern, TemplateGenerator, GeneratorConfig, TemplateResolver, ResolutionContext, ResolutionResult};
