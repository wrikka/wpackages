use crate::error::EmbeddingsResult;
use crate::services::traits::model::Model;
use async_trait::async_trait;
use candle_core::{Device, Tensor};
use candle_nn::VarBuilder;
use candle_transformers::models::bert::{BertModel as RobertaModel, Config};
use serde_json::Value;

#[async_trait]
impl Model for RobertaModel {
    fn new(vb: VarBuilder, config: &Value, _device: &Device) -> EmbeddingsResult<Self>
    where
        Self: Sized,
    {
        let config: Config = serde_json::from_value(config.clone()).map_err(|e| {
            crate::error::EmbeddingsError::ModelLoad(format!("Failed to parse Roberta config: {}", e))
        })?;
        RobertaModel::load(vb, &config)
            .map_err(|e| crate::error::EmbeddingsError::ModelLoad(e.to_string()))
    }

    async fn get_text_embeddings(
        &self,
        input_ids: &Tensor,
        attention_mask: &Tensor,
        token_type_ids: Option<&Tensor>,
    ) -> EmbeddingsResult<Tensor> {
        let token_type_ids = token_type_ids.unwrap_or(&Tensor::zeros_like(input_ids).unwrap());
        candle_transformers::models::bert::BertModel::forward(self, input_ids, attention_mask, Some(token_type_ids))
            .map_err(|e| crate::error::EmbeddingsError::Inference(e.to_string()))
    }
}
