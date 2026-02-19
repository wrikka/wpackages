use crate::Result;
use async_trait::async_trait;
use embeddings::{EmbeddingOptions, EmbeddingRequest, EmbeddingsApp, EmbeddingsConfig};

#[async_trait]
pub trait EmbeddingsAdapter: Send + Sync {
    async fn generate_embedding(&self, text: &str) -> Result<Vec<f32>>;
    async fn generate_embeddings(&self, texts: &[String]) -> Result<Vec<Vec<f32>>>;
    async fn get_dimension(&self) -> Result<usize>;
}

pub struct RealEmbeddingsAdapter {
    app: EmbeddingsApp,
}

impl RealEmbeddingsAdapter {
    pub async fn new(config: EmbeddingsConfig) -> Result<Self> {
        let app = EmbeddingsApp::new(config)
            .await
            .map_err(|e| crate::error::AgentError::Embeddings(e))?;
        Ok(Self { app })
    }

    pub fn from_app(app: EmbeddingsApp) -> Self {
        Self { app }
    }
}

#[async_trait]
impl EmbeddingsAdapter for RealEmbeddingsAdapter {
    async fn generate_embedding(&self, text: &str) -> Result<Vec<f32>> {
        let request = EmbeddingRequest {
            texts: vec![text.to_string()],
            options: EmbeddingOptions::default(),
        };

        let response = self
            .app
            .generate_embeddings(request)
            .await
            .map_err(|e| crate::error::AgentError::Embeddings(e))?;

        Ok(response.embeddings.into_iter().next().unwrap_or_default())
    }

    async fn generate_embeddings(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        let request = EmbeddingRequest {
            texts: texts.to_vec(),
            options: EmbeddingOptions::default(),
        };

        let response = self
            .app
            .generate_embeddings(request)
            .await
            .map_err(|e| crate::error::AgentError::Embeddings(e))?;

        Ok(response.embeddings)
    }

    async fn get_dimension(&self) -> Result<usize> {
        let request = EmbeddingRequest {
            texts: vec!["test".to_string()],
            options: EmbeddingOptions::default(),
        };

        let response = self
            .app
            .generate_embeddings(request)
            .await
            .map_err(|e| crate::error::AgentError::Embeddings(e))?;

        Ok(response.dimension)
    }
}
