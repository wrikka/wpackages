use crate::config::EmbeddingsConfig;
use crate::error::{EmbeddingsError, EmbeddingsResult};
use crate::services::{EmbeddingsModel, ModelInfo, ModelType};
use std::collections::HashMap;
use std::sync::Arc;

pub struct ModelRegistry {
    models: HashMap<String, Arc<EmbeddingsModel>>,
    model_info: HashMap<String, ModelInfo>,
    default_model: Option<String>,
}

impl ModelRegistry {
    pub fn new() -> Self {
        Self {
            models: HashMap::new(),
            model_info: HashMap::new(),
            default_model: None,
        }
    }

    pub async fn register_model(
        &mut self,
        name: impl Into<String>,
        model_type: ModelType,
        dimension: usize,
        config: EmbeddingsConfig,
    ) -> EmbeddingsResult<()> {
        let name = name.into();
        let model = Arc::new(EmbeddingsModel::new(config.clone()).await?);

        let info = ModelInfo {
            name: name.clone(),
            model_type,
            dimension,
            max_length: config.max_length.unwrap_or(512),
            config,
        };

        self.models.insert(name.clone(), model);
        self.model_info.insert(name.clone(), info);

        if self.default_model.is_none() {
            self.default_model = Some(name.clone());
        }

        Ok(())
    }

    pub fn get_model(&self, name: &str) -> EmbeddingsResult<Arc<EmbeddingsModel>> {
        self.models
            .get(name)
            .cloned()
            .ok_or_else(|| EmbeddingsError::InvalidConfig(format!("Model '{}' not found", name)))
    }

    pub fn get_default_model(&self) -> EmbeddingsResult<Arc<EmbeddingsModel>> {
        let name = self
            .default_model
            .as_ref()
            .ok_or_else(|| EmbeddingsError::InvalidConfig("No default model set".to_string()))?;
        self.get_model(name)
    }

    pub fn set_default_model(&mut self, name: &str) -> EmbeddingsResult<()> {
        if !self.models.contains_key(name) {
            return Err(EmbeddingsError::InvalidConfig(format!(
                "Model '{}' not found",
                name
            )));
        }
        self.default_model = Some(name.to_string());
        Ok(())
    }

    pub fn get_model_info(&self, name: &str) -> Option<&ModelInfo> {
        self.model_info.get(name)
    }

    pub fn list_models(&self) -> Vec<&ModelInfo> {
        self.model_info.values().collect()
    }

    pub fn remove_model(&mut self, name: &str) -> EmbeddingsResult<()> {
        if !self.models.contains_key(name) {
            return Err(EmbeddingsError::InvalidConfig(format!(
                "Model '{}' not found",
                name
            )));
        }

        self.models.remove(name);
        self.model_info.remove(name);

        if self.default_model.as_deref() == Some(name) {
            self.default_model = self.models.keys().next().cloned();
        }

        Ok(())
    }
}

impl Default for ModelRegistry {
    fn default() -> Self {
        Self::new()
    }
}
