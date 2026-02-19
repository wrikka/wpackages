//! Retrieval-Augmented Generation Service
//!
//! Provides RAG capabilities for AI-powered document retrieval and generation.

pub mod adapters;
pub mod cache;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod application;
pub mod core;
pub mod domain;
pub mod infrastructure;

pub mod telemetry;
pub mod utils;
pub mod api;
pub mod cli;
pub mod plugins;

pub use adapters::{embedding::*, sparse::*, vector_store::*};
pub use cache::{CachedRAGResponse, RAGCache, RAGCacheKey};
pub use components::*;
pub use config::RagConfig;
pub use error::{RagError, RagResult};
pub use application::services::{qna_service::*, rag_service::*};
pub use telemetry::init_subscriber;
pub use domain::*;
pub use utils::*;
