use crate::error::{SchemaError, SchemaResult};
use crate::types::Schema;
use async_trait::async_trait;
use std::sync::Arc;

#[async_trait]
pub trait AsyncValidator: Send + Sync {
    async fn validate_async(&self, value: &serde_json::Value) -> SchemaResult<()>;
}

pub struct ValidatorService {
    schema: Arc<Schema>,
}

impl ValidatorService {
    pub fn new(schema: Schema) -> Self {
        Self {
            schema: Arc::new(schema),
        }
    }

    pub fn validate(&self, value: &serde_json::Value) -> SchemaResult<()> {
        self.schema.validate(value)
    }

    pub async fn validate_async(&self, value: serde_json::Value) -> SchemaResult<()> {
        let schema = Arc::clone(&self.schema);
        tokio::task::spawn_blocking(move || schema.validate(&value))
            .await
            .map_err(|e| SchemaError::CustomValidation {
                message: format!("Task join error: {}", e),
                path: None,
            })?
    }
}

#[async_trait]
impl AsyncValidator for ValidatorService {
    async fn validate_async(&self, value: &serde_json::Value) -> SchemaResult<()> {
        self.validate_async(value.clone()).await
    }
}
