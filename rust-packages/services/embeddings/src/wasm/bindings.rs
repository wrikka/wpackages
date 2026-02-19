use crate::config::EmbeddingsConfig;
use crate::services::EmbeddingsService;
use crate::types::{Embedding, EmbeddingRequest};
use js_sys::Array;
use std::sync::Arc;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;

#[wasm_bindgen]
pub struct Embeddings {
    service: Arc<EmbeddingsService>,
}

#[wasm_bindgen]
impl Embeddings {
    #[wasm_bindgen(constructor)]
    pub async fn new(config: JsValue) -> Result<Embeddings, JsValue> {
        let config: EmbeddingsConfig = serde_wasm_bindgen::from_value(config)?;
        let service = Arc::new(EmbeddingsService::new(config).await.map_err(|e| {
            JsValue::from_str(&format!("Failed to create service: {}", e))
        })?);
        Ok(Self { service })
    }

    #[wasm_bindgen(js_name = embedText)]
    pub fn embed_text(&self, texts: Vec<String>) -> js_sys::Promise {
        let service = self.service.clone();
        future_to_promise(async move {
            let embeddings = service.embed_text_batch(texts).await.map_err(|e| {
                JsValue::from_str(&format!("Failed to embed text: {}", e))
            })?;

            let result = Array::new();
            for embedding in embeddings {
                let arr = Array::new();
                for val in embedding {
                    arr.push(&JsValue::from_f64(val as f64));
                }
                result.push(&arr);
            }

            Ok(result.into())
        })
    }
}
