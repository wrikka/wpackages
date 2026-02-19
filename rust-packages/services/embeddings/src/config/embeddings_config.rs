//! Configuration management for the embeddings service
use super::vector_db_config::VectorDBConfig;
use crate::error::{EmbeddingsError, EmbeddingsResult};
use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};

/// Embeddings configuration loaded from Config.toml and environment variables
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingsConfig {
    pub model_id: String,
    pub device: Option<String>,
    pub quantized: Option<bool>,
    pub pooling: Option<String>,
    pub max_length: Option<usize>,
    pub normalize: Option<bool>,
    pub batch_size: usize,
    pub vector_db: Option<VectorDBConfig>,
    pub rate_limit: Option<usize>,
    pub api_key: Option<String>,
}

impl EmbeddingsConfig {
    /// Load configuration from Config.toml and environment variables
    ///
    /// Environment variables can override config file values using the EMBEDDINGS_ prefix:
    /// - EMBEDDINGS_MODEL_ID
    /// - EMBEDDINGS_DEVICE
    /// - EMBEDDINGS_QUANTIZED
    /// - EMBEDDINGS_POOLING
    /// - EMBEDDINGS_MAX_LENGTH
    /// - EMBEDDINGS_NORMALIZE
    /// - EMBEDDINGS_BATCH_SIZE
    /// - EMBEDDINGS_VECTOR_DB__DB_TYPE
    /// - EMBEDDINGS_VECTOR_DB__URL
    /// - EMBEDDINGS_VECTOR_DB__COLLECTION_NAME
    /// - EMBEDDINGS_RATE_LIMIT
    /// - EMBEDDINGS_API_KEY
    pub fn load() -> Result<Self, Box<figment::Error>> {
        Figment::new()
            .merge(Toml::file("Config.toml"))
            .merge(Env::prefixed("EMBEDDINGS_").split("__"))
            .extract()
            .map_err(Box::new)
    }

    pub fn validate(&self) -> EmbeddingsResult<()> {
        if self.model_id.is_empty() {
            return Err(EmbeddingsError::InvalidConfig(
                "Model ID cannot be empty".to_string(),
            ));
        }
        if self.batch_size == 0 {
            return Err(EmbeddingsError::InvalidConfig(
                "Batch size must be greater than 0".to_string(),
            ));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

}
