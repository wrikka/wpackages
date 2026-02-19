use crate::error::EmbeddingsResult;
use crate::services::traits::model::Model;
use async_trait::async_trait;
use candle_core::{Device, Tensor};
use candle_nn::VarBuilder;
use candle_transformers::models::clip::{ClipModel, Config};
use serde_json::Value;

#[async_trait]
impl Model for ClipModel {
    fn new(vb: VarBuilder, config: &Value, _device: &Device) -> EmbeddingsResult<Self>
    where
        Self: Sized,
    {
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| crate::error::EmbeddingsError::ModelLoad(format!("Failed to parse Clip config: {}", e)))?;
        ClipModel::new(vb, &config).map_err(|e| crate::error::EmbeddingsError::ModelLoad(e.to_string()))
    }

    async fn get_text_embeddings(
        &self,
        input_ids: &Tensor,
        _attention_mask: &Tensor,
        _token_type_ids: Option<&Tensor>,
    ) -> EmbeddingsResult<Tensor> {
        self.get_text_features(input_ids)
            .map_err(|e| crate::error::EmbeddingsError::Inference(e.to_string()))
    }

    async fn get_image_embeddings(&self, pixel_values: &Tensor) -> EmbeddingsResult<Tensor> {
        self.get_image_features(pixel_values)
            .map_err(|e| crate::error::EmbeddingsError::Inference(e.to_string()))
    }
}
