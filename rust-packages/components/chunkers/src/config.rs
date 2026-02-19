//! Chunking Strategies Configuration
//!
//! Configuration management using Figment

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkingStrategiesConfig {
    pub recursive: RecursiveConfig,
    pub semantic: SemanticConfig,
    pub code_aware: CodeAwareConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecursiveConfig {
    pub chunk_size: usize,
    pub chunk_overlap: usize,
    pub min_chunk_size: usize,
    pub max_chunk_size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticConfig {
    pub chunk_size: usize,
    pub chunk_overlap: usize,
    pub min_chunk_size: usize,
    pub similarity_threshold: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeAwareConfig {
    pub chunk_size: usize,
    pub chunk_overlap: usize,
    pub min_chunk_size: usize,
    pub language: String,
}

impl Default for ChunkingStrategiesConfig {
    fn default() -> Self {
        Self {
            recursive: RecursiveConfig {
                chunk_size: 512,
                chunk_overlap: 50,
                min_chunk_size: 100,
                max_chunk_size: 2048,
            },
            semantic: SemanticConfig {
                chunk_size: 512,
                chunk_overlap: 50,
                min_chunk_size: 100,
                similarity_threshold: 0.5,
            },
            code_aware: CodeAwareConfig {
                chunk_size: 1024,
                chunk_overlap: 100,
                min_chunk_size: 50,
                language: "rs".to_string(),
            },
        }
    }
}

impl ChunkingStrategiesConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("CHUNKING_").split("__"))
            .extract()
    }
}
