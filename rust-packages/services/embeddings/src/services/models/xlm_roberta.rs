use crate::error::EmbeddingsResult;
use crate::services::traits::model::Model;
use async_trait::async_trait;
use candle_core::{Device, Tensor};
use candle_nn::VarBuilder;
use candle_transformers::models::xlm_roberta::{XLMRobertaModel, Config};
use serde_json::Value;

#[async_trait]
impl Model for XLMRobertaModel {
    fn new(vb: VarBuilder, config: &Value, _device: &Device) -> EmbeddingsResult<Self>
    where
        Self: Sized,
    {
        let config: Config = serde_json::from_value(config.clone()).map_err(|e| {
            crate::error::EmbeddingsError::ModelLoad(format!("Failed to parse XLM-RoBERTa config: {}", e))
        })?;
        XLMRobertaModel::load(vb, &config)
            .map_err(|e| crate::error::EmbeddingsError::ModelLoad(e.to_string()))
    }

    async fn get_text_embeddings(
        &self,
        input_ids: &Tensor,
        _attention_mask: &Tensor,
        _token_type_ids: Option<&Tensor>,
    ) -> EmbeddingsResult<Tensor> {
        self.forward(input_ids)
            .map_err(|e| crate::error::EmbeddingsError::Inference(e.to_string()))
    }
}
