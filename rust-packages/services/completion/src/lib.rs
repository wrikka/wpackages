//! AI Completion Service
//!
//! Provides AI-powered code completion, debugging, and refactoring capabilities.

pub mod adapters;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

pub mod prelude;

pub use crate::config::CompletionConfig;
pub use crate::error::{CompletionError, CompletionResult};
pub use crate::services::{CacheKey, CompletionCache, CompletionService, InMemoryCache};
pub use crate::telemetry::init_subscriber;
pub use crate::types::{Completion, CompletionRequest, CompletionResponse};
