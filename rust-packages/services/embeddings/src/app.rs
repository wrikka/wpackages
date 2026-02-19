use crate::config::EmbeddingsConfig;
use crate::error::EmbeddingsResult;
use crate::services::{EmbeddingsService, ModelRegistry};
use crate::types::{EmbeddingRequest, EmbeddingResponse};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub app: Arc<EmbeddingsApp>,
}

pub struct EmbeddingsApp {
    pub service: Arc<EmbeddingsService>,
    pub config: EmbeddingsConfig,
    registry: ModelRegistry,
}

impl EmbeddingsApp {
    pub async fn new(config: EmbeddingsConfig) -> EmbeddingsResult<Self> {
        let service = Arc::new(EmbeddingsService::new(config.clone()).await?);
        let registry = ModelRegistry::new();

        Ok(Self { service, config, registry })
    }


    pub fn registry(&self) -> &ModelRegistry {
        &self.registry
    }

    pub fn registry_mut(&mut self) -> &mut ModelRegistry {
        &mut self.registry
    }

    pub async fn generate_embeddings(
        &self,
        request: EmbeddingRequest,
    ) -> EmbeddingsResult<EmbeddingResponse> {
        self.service.embed_text(request).await
    }



}

#[cfg(test)]
mod tests {
    use super::*;

}
