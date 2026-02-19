use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EmbeddingsRequest {
    texts: Vec<String>,
    options: EmbeddingsOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EmbeddingsOptions {
    normalize: bool,
    max_length: Option<usize>,
}

impl Default for EmbeddingsOptions {
    fn default() -> Self {
        Self { normalize: true, max_length: None }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EmbeddingsResponse {
    pub embeddings: Vec<Vec<f32>>,
    pub dimension: usize,
    pub tokens_used: usize,
}

pub struct EmbeddingClient {
    client: reqwest::Client,
    api_url: String,
}

impl EmbeddingClient {
    pub fn new(api_url: String) -> Self {
        Self { client: reqwest::Client::new(), api_url }
    }

    pub async fn get_embeddings(&self, texts: Vec<String>) -> anyhow::Result<EmbeddingsResponse> {
        let req = EmbeddingsRequest {
            texts,
            options: EmbeddingsOptions::default(),
        };
        let resp: EmbeddingsResponse = self.client.post(&self.api_url).json(&req).send().await?.error_for_status()?.json().await?;
        Ok(resp)
    }
}
