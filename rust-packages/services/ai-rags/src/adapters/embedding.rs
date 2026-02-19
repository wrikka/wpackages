//! Embedding adapter for external embedding services

use crate::error::RagResult;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// Trait for embedding generation
#[async_trait]
pub trait EmbeddingProvider: Send + Sync {
    async fn generate_embedding(&self, text: &str) -> RagResult<Vec<f32>>;

    async fn generate_embeddings(&self, texts: &[String]) -> RagResult<Vec<Vec<f32>>> {
        let mut embeddings = Vec::new();
        for text in texts {
            embeddings.push(self.generate_embedding(text).await?);
        }
        Ok(embeddings)
    }
}

pub struct OpenAIEmbeddingProvider {
    client: reqwest::Client,
    api_key: String,
    model: String,
}

impl OpenAIEmbeddingProvider {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_key,
            model,
        }
    }
}

#[derive(Debug, Serialize)]
struct OpenAIEmbeddingRequest<'a> {
    model: &'a str,
    input: &'a str,
}

#[derive(Debug, Deserialize)]
struct OpenAIEmbeddingResponse {
    data: Vec<OpenAIEmbeddingItem>,
}

#[derive(Debug, Deserialize)]
struct OpenAIEmbeddingItem {
    embedding: Vec<f32>,
}

#[async_trait]
impl EmbeddingProvider for OpenAIEmbeddingProvider {
    async fn generate_embedding(&self, text: &str) -> RagResult<Vec<f32>> {
        let req_body = OpenAIEmbeddingRequest {
            model: &self.model,
            input: text,
        };

        let res = self
            .client
            .post("https://api.openai.com/v1/embeddings")
            .bearer_auth(&self.api_key)
            .json(&req_body)
            .send()
            .await?
            .error_for_status()?;

        let parsed: OpenAIEmbeddingResponse = res.json().await?;
        Ok(parsed
            .data
            .into_iter()
            .next()
            .map(|x| x.embedding)
            .unwrap_or_default())
    }
}

/// Mock embedding provider for testing
pub struct MockEmbeddingProvider {
    embedding_dim: usize,
}

impl MockEmbeddingProvider {
    pub fn new(embedding_dim: usize) -> Self {
        Self { embedding_dim }
    }
}

#[async_trait]
impl EmbeddingProvider for MockEmbeddingProvider {
    async fn generate_embedding(&self, _text: &str) -> RagResult<Vec<f32>> {
        Ok(vec![0.0; self.embedding_dim])
    }
}
