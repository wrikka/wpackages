//! # AI Memories
//!
//! A highly-performant, scalable, and adaptable memory system for AI agents,
//! built with SOLID principles in Rust.
//!
//! ## Modules
//!
//! - **simple**: Simple long-term and working memory (sled-based)
//! - **system**: Advanced memory system with vector indexing
//! - **graph**: Memory graph for relationships
//! - **models**: Core data models

// Declare the modules
pub mod config;
pub mod consolidation;
pub mod decay;
pub mod error;
pub mod graph;
pub mod index;
pub mod models;
pub mod simple;
pub mod store;
pub mod system;
pub mod utils;

// --- Public API Re-exports ---

// Simple memory (from computer-use)
pub use simple::{
    LongTermMemory, MemoryEntry, SessionContext, SimpleMemoryError, TaskState, TaskStatus,
    WorkingMemory,
};

// Core system and configuration
pub use config::MemorySystemConfig;
pub use error::MemorySystemError;
pub use system::MemorySystem;

// Core data models
pub use models::{Emotion, Embedding, Memory, MemoryContent, MemoryId};

// Traits for extensibility
pub use decay::DecayStrategy;
pub use index::VectorIndex;
pub use store::MemoryStore;

// Concrete implementations
pub use decay::exponential_decay::ExponentialDecay;
pub use decay::spaced_repetition_decay::SpacedRepetitionDecay;
pub use index::lsh_index::LshIndex;
pub use store::hash_map_store::HashMapMemoryStore;

// Graph and consolidation components
pub use graph::{MemoryGraph, Relationship};
pub use consolidation::Summarizer;

