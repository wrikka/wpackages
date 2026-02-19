//! AI Suite - Orchestration Layer for AI/ML services
//!
//! This module provides a unified interface for coordinating multiple AI/ML services:
//! - Completion (from `completion` package)
//! - Embeddings (from `embeddings` package)
//! - Vector Search (from `semantic-search` package)
//! - RAG (from `rags` package)

pub mod app;
pub mod config;
pub mod error;
pub mod telemetry;

// Re-export common types
pub use app::AiSuite;
pub use config::AiSuiteConfig;
pub use error::{AiSuiteError, AiSuiteResult};
