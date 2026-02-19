//! Chunking Strategies
//!
//! Provides advanced chunking strategies (Recursive, Semantic, Code-aware).

pub mod code_aware;
pub mod config;
pub mod constants;
pub mod error;
pub mod recursive;
pub mod semantic;
pub mod telemetry;
pub mod types;
pub mod utils;

pub use code_aware::*;
pub use config::ChunkingStrategiesConfig;
pub use constants::*;
pub use error::{ChunkingError, ChunkingResult};
pub use recursive::*;
pub use semantic::*;
pub use telemetry::init_subscriber;
pub use types::{Chunk, ChunkMetadata, ChunkOutput, ChunkingConfig, ChunkingStrategy, Chunker};
pub use utils::*;
