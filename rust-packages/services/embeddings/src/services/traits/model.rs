use crate::error::EmbeddingsResult;
use crate::error::{EmbeddingsError, EmbeddingsResult};
use async_trait::async_trait;
use candle_core::{Device, Tensor};
use candle_nn::VarBuilder;
use serde_json::Value;

/// A common interface for different embedding model architectures.
#[async_trait]
pub trait Model: Send + Sync {
    /// Creates a new instance of the model.
    fn new(vb: VarBuilder, config: &Value, device: &Device) -> EmbeddingsResult<Self>
    where
        Self: Sized;

    /// Generates text embeddings.
    async fn get_text_embeddings(
        &self,
        input_ids: &Tensor,
        attention_mask: &Tensor,
        token_type_ids: Option<&Tensor>,
    ) -> EmbeddingsResult<Tensor> {
        Err(EmbeddingsError::Inference(
            "Text embeddings not supported by this model".to_string(),
        ))
    }

    /// Generates image embeddings.
    async fn get_image_embeddings(&self, pixel_values: &Tensor) -> EmbeddingsResult<Tensor> {
        Err(EmbeddingsError::Inference(
            "Image embeddings not supported by this model".to_string(),
        ))
    }
}
