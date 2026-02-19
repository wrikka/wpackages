//! AI Models Library
//!
//! This library provides a unified interface for working with various AI models and providers.

// Public API - Application Layer
pub mod app;

// Configuration
pub mod config;

// Core types and traits
pub mod types;

// Error handling
pub mod error;

// Observability
pub mod telemetry;

// Constants
pub mod constants;

// Pure layer - Domain logic
pub mod components;

// Effect layer - I/O operations
pub mod services;

// Adapters for external libraries
pub mod adapters;

// Utility functions
pub mod utils;

// Provider implementations
pub mod providers;

// Re-exports for convenience
pub use adapters::*;
pub use app::AiModelsApp;
pub use components::*;
pub use config::{AiModelsConfig, CacheConfig, ProviderConfig, RetryConfig, StrategyConfig};
pub use constants::*;
pub use error::{AiModelsError, Result};
pub use providers::*;
pub use services::{
    capabilities::{ModelCapability, Modality},
    registry::{create_default_registry, ModelRegistry},
    *,
};
pub use telemetry::{init_subscriber, init_subscriber_with_config};
pub use types::traits::{
    ChatModel, CompletionModel, EmbeddingsModel, ModelProvider, UnifiedModelProvider,
};
pub use types::*;
pub use utils::*;

/// Library version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
