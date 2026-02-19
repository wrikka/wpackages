use crate::config::EmbeddingsConfig;
use crate::error::{EmbeddingsError, EmbeddingsResult};
use crate::models::manager::ModelManager;
use crate::services::ModelMetrics;
use crate::finetune::{trainer::FinetuneTrainer, types::FinetuneConfig};
use crate::types::*;
use crate::utils::device::get_device;
use cache::prelude::*;
use candle_core::{Device, Tensor};
use candle_nn::VarBuilder;
use crate::services::models::{bert::BertModel, roberta::RobertaModel, clip::ClipModel, xlm_roberta::XLMRobertaModel};
use crate::services::traits::model::Model;
use crate::services::vector_db::{qdrant::QdrantDB, traits::VectorDB};
use serde_json::Value;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tokenizers::Tokenizer;
use tokio::sync::RwLock;

pub struct EmbeddingsModel {
    model: Arc<dyn Model>,
    tokenizer: Tokenizer,
    device: Device,
    config: EmbeddingsConfig,
    metrics: Arc<RwLock<ModelMetrics>>,
    model_manager: Arc<ModelManager>,
}

impl EmbeddingsModel {
    pub async fn new(config: EmbeddingsConfig) -> EmbeddingsResult<Self> {
        config.validate()?;

        let device = get_device(config.device.clone());

        let model_manager = Arc::new(
            ModelManager::new()
                .await
                .map_err(|e| EmbeddingsError::ModelLoad(format!("Failed to create ModelManager: {}", e)))?,
        );

        let model_path = model_manager
            .get_model(&config.model_id)
            .await
            .map_err(|e| {
                EmbeddingsError::ModelLoad(format!(
                    "Failed to download model '{}': {}",
                    &config.model_id,
                    e
                ))
            })?;

        let config_path = model_path.join("config.json");
        let config_str = std::fs::read_to_string(config_path)
            .map_err(|e| EmbeddingsError::ModelLoad(format!("Failed to read config.json: {}", e)))?;
        let model_config_json: Value = serde_json::from_str(&config_str)
            .map_err(|e| EmbeddingsError::ModelLoad(format!("Failed to parse config.json: {}", e)))?;

        let model_type = model_config_json["model_type"]
            .as_str()
            .unwrap_or("bert")
            .to_lowercase();


        let weights_path = if model_path.join("model.safetensors").exists() {
            model_path.join("model.safetensors")
        } else {
            model_path.join("pytorch_model.bin")
        };

        let vb = if config.quantized.unwrap_or(false) {
            let quantized_model_path = model_manager
                .get_quantized_model(&config.model_id, "model.gguf")
                .await
                .map_err(|e| {
                    EmbeddingsError::ModelLoad(format!(
                        "Failed to download quantized model '{}': {}",
                        &config.model_id,
                        e
                    ))
                })?;
            VarBuilder::from_gguf(quantized_model_path, &device).map_err(|e| {
                EmbeddingsError::ModelLoad(format!("Failed to load quantized model weights: {}", e))
            })?
        } else {
            VarBuilder::from_pth(weights_path, candle_core::DType::F32, &device)
                .map_err(|e| EmbeddingsError::ModelLoad(format!("Failed to load model weights: {}", e)))?
        };

        let model: Arc<dyn Model> = match model_type.as_str() {
            "bert" => Arc::new(BertModel::new(vb, &model_config_json, &device)?),
            "roberta" => Arc::new(RobertaModel::new(vb, &model_config_json, &device)?),
            "clip" => Arc::new(ClipModel::new(vb, &model_config_json, &device)?),
            "xlm-roberta" => Arc::new(XLMRobertaModel::new(vb, &model_config_json, &device)?),
            _ => {
                return Err(EmbeddingsError::ModelLoad(format!(
                    "Unsupported model type: {}",
                    model_type
                )))
            }
        };

        let tokenizer_path = model_path.join("tokenizer.json");
        let tokenizer = Tokenizer::from_file(tokenizer_path)
            .map_err(|e| EmbeddingsError::Tokenization(format!("Failed to load tokenizer: {}", e)))?;


        Ok(Self {
            model,
            tokenizer,
            device,
            config,
            metrics: Arc::new(RwLock::new(ModelMetrics::default())),
            model_manager,
        })
    }


    pub async fn generate_text_embeddings(&self, texts: Vec<String>) -> EmbeddingsResult<Vec<Embedding>> {
        if texts.is_empty() {
            return Ok(Vec::new());
        }

        let num_texts = texts.len();

        let tokenizer = self.tokenizer.clone();
        let encodings = tokio::task::spawn_blocking(move || {
            tokenizer
                .encode_batch(texts, true)
                .map_err(|e| EmbeddingsError::Tokenization(format!("Failed to tokenize batch: {}", e)))
        })
        .await
        .map_err(|e| EmbeddingsError::Tokenization(format!("Failed to run tokenization task: {}", e)))??;

        let max_len = encodings.iter().map(|e| e.get_ids().len()).max().unwrap_or(0);

        let mut all_input_ids = Vec::new();
        let mut all_attention_masks = Vec::new();

        for encoding in encodings {
            let mut input_ids = encoding.get_ids().to_vec();
            let mut attention_mask = encoding.get_attention_mask().to_vec();

            let pad_len = max_len - input_ids.len();
            input_ids.extend(vec![0; pad_len]);
            attention_mask.extend(vec![0; pad_len]);

            all_input_ids.extend(input_ids);
            all_attention_masks.extend(attention_mask);
        }

        let device = self.device.clone();
        let input_ids_tensor = tokio::task::spawn_blocking(move || {
            Tensor::new(all_input_ids, &device)
                .and_then(|t| t.reshape((num_texts, max_len)))
                .map_err(|e| {
                    EmbeddingsError::Inference(format!("Failed to create input_ids tensor: {}", e))
                })
        })
        .await
        .map_err(|e| EmbeddingsError::Inference(format!("Failed to run input_ids tensor task: {}", e)))??;

        let device = self.device.clone();
        let attention_mask_tensor = tokio::task::spawn_blocking(move || {
            Tensor::new(all_attention_masks, &device)
                .and_then(|t| t.reshape((num_texts, max_len)))
                .map_err(|e| {
                    EmbeddingsError::Inference(format!("Failed to create attention_mask tensor: {}", e))
                })
        })
        .await
        .map_err(|e| {
            EmbeddingsError::Inference(format!("Failed to run attention_mask tensor task: {}", e))
        })??;

        let output = self
            .model
            .get_text_embeddings(&input_ids_tensor, &attention_mask_tensor, None)
            .await?;

        let embeddings = match self.config.pooling.as_deref() {
            Some("none") => {
                // Return token-level embeddings (no pooling)
                output
            }
            Some("cls") => {
                // Use the embedding of the [CLS] token
                output.narrow(1, 0, 1).unwrap()
            }
            Some("max") => {
                // Use max-over-time pooling
                output.max(1).unwrap()
            }
            _ => {
                // Default to mean pooling
                let (_b, n, _d) = output.dims3().unwrap();
                let sum = output.sum(1).unwrap();
                let count = Tensor::new(&[n as f32], &self.device).unwrap();
                sum.broadcast_div(&count).unwrap()
            }
        };

        let embeddings: Vec<Embedding> = embeddings.to_vec2().unwrap();

        Ok(embeddings)
    }

    pub async fn generate_text_embeddings_batch(
        &self,
        texts: Vec<String>,
        batch_size: Option<usize>,
    ) -> EmbeddingsResult<Vec<Embedding>> {
        let batch_size = batch_size.unwrap_or(self.config.batch_size);
        let mut all_embeddings = Vec::with_capacity(texts.len());

        for chunk in texts.chunks(batch_size) {
            let embeddings = self.generate_text_embeddings(chunk.to_vec()).await?;
            all_embeddings.extend(embeddings);
        }

        Ok(all_embeddings)
    }

    pub async fn embed(&self, request: EmbeddingRequest) -> EmbeddingsResult<EmbeddingResponse> {
        let embeddings = self.generate_text_embeddings_batch(request.texts, Some(self.config.batch_size)).await?;

        let dimension = embeddings.first().map(|e| e.len()).unwrap_or(0);
        let tokens_used = embeddings.len() * dimension;

        Ok(EmbeddingResponse {
            embeddings,
            dimension,
            tokens_used,
        })
    }

    pub fn get_config(&self) -> &EmbeddingsConfig {
        &self.config
    }

    pub async fn get_metrics(&self) -> ModelMetrics {
        self.metrics.read().await.clone()
    }

    pub async fn reset_metrics(&self) {
        let mut metrics = self.metrics.write().await;
        *metrics = ModelMetrics::default();
    }



    pub async fn finetune(self: Arc<Self>, config: FinetuneConfig) -> EmbeddingsResult<()> {
        let trainer = FinetuneTrainer::new(config, self.clone());
        trainer.train().await
    }

    pub async fn generate_image_embeddings(
        &self,
        image_paths: Vec<PathBuf>,
    ) -> EmbeddingsResult<Vec<Embedding>> {
        let mut pixel_values_list = Vec::new();
        for image_path in image_paths {
            let image = image::open(image_path)
                .map_err(|e| EmbeddingsError::Inference(format!("Failed to open image: {}", e)))?
                .resize_to_fill(224, 224, image::imageops::FilterType::Triangle);
            let input = Tensor::from_vec(
                image.to_rgb8().into_raw(),
                &[224, 224, 3],
                &self.device,
            )
            .map_err(|e| EmbeddingsError::Inference(format!("Failed to create image tensor: {}", e)))?;
            pixel_values_list.push(input);
        }

        let pixel_values = Tensor::stack(&pixel_values_list, 0)
            .map_err(|e| EmbeddingsError::Inference(format!("Failed to stack image tensors: {}", e)))?;

        let output = self.model.get_image_embeddings(&pixel_values).await?;
        let embeddings: Vec<Embedding> = output.to_vec2().unwrap();
        Ok(embeddings)
    }

}
