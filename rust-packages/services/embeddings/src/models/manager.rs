use crate::models::hub::Hub;
use anyhow::Result;
use std::path::{Path, PathBuf};

/// Manages the downloading and caching of models.
pub struct ModelManager {
    hub: Hub,
    cache_dir: PathBuf,
}

impl ModelManager {
    /// Creates a new ModelManager.
    pub async fn new() -> Result<Self> {
        let cache_dir = dirs::cache_dir()
            .ok_or_else(|| anyhow::anyhow!("Failed to get cache directory"))?
            .join("w-embeddings");

        std::fs::create_dir_all(&cache_dir)?;

        Ok(Self {
            hub: Hub::new().await?,
            cache_dir,
        })
    }

    /// Gets the path to a model, downloading it if necessary.
    ///
    /// # Arguments
    ///
    /// * `model_id` - The ID of the model to get.
    ///
    /// # Returns
    ///
    /// A `Result` containing the path to the model directory.
    pub async fn get_model(&self, model_id: &str) -> Result<PathBuf> {
        let model_dir = self.get_model_dir(model_id);
        if model_dir.exists() {
            return Ok(model_dir);
        }

        self.hub.download(model_id).await
    }

    /// Gets the local directory for a given model ID.
    ///
    /// # Arguments
    ///
    /// * `model_id` - The ID of the model.
    ///
    /// # Returns
    ///
    /// The path to the local model directory.
    pub fn get_model_dir(&self, model_id: &str) -> PathBuf {
        self.cache_dir.join(model_id.replace('/', "--"))
    }

    /// Gets the path to a quantized model file, downloading it if necessary.
    ///
    /// # Arguments
    ///
    /// * `model_id` - The ID of the model to get.
    /// * `filename` - The specific GGUF filename to download.
    ///
    /// # Returns
    ///
    /// A `Result` containing the path to the quantized model file.
    pub async fn get_quantized_model(&self, model_id: &str, filename: &str) -> Result<PathBuf> {
        let file_path = self.get_model_dir(model_id).join(filename);
        if file_path.exists() {
            return Ok(file_path);
        }

        self.hub.download_file(model_id, filename).await
    }
}
