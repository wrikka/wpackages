use anyhow::Result;
use hf_hub::{api::tokio::Api, Repo, RepoType};
use std::path::{Path, PathBuf};

/// A client for interacting with the Hugging Face Hub.
#[derive(Clone, Debug)]
pub struct Hub {
    api: Api,
}

impl Hub {
    /// Creates a new Hub client.
    pub async fn new() -> Result<Self> {
        Ok(Self {
            api: Api::new().await?,
        })
    }

    /// Downloads a model from the Hugging Face Hub.
    ///
    /// # Arguments
    ///
    /// * `model_id` - The ID of the model to download (e.g., "sentence-transformers/all-MiniLM-L6-v2").
    ///
    /// # Returns
    ///
    /// A `Result` containing the path to the downloaded model directory.
    pub async fn download(&self, model_id: &str) -> Result<PathBuf> {
        let repo = Repo::new(model_id.to_string(), RepoType::Model);
        let api = self.api.repo(repo);
        let model_path = api.get_path().await?;
        Ok(model_path)
    }

    /// Downloads a specific file from a model repository.
    ///
    /// # Arguments
    ///
    /// * `model_id` - The ID of the model repository.
    /// * `filename` - The name of the file to download.
    ///
    /// # Returns
    ///
    /// A `Result` containing the path to the downloaded file.
    pub async fn download_file(&self, model_id: &str, filename: &str) -> Result<PathBuf> {
        let repo = Repo::new(model_id.to_string(), RepoType::Model);
        let api = self.api.repo(repo);
        let file_path = api.get(filename).await?;
        Ok(file_path)
    }
}
