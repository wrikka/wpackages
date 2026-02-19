//! Model service trait

use async_trait::async_trait;
use crate::error::{EvalError, EvalResult};
use super::info::ModelInfo;

/// Trait for model service operations (I/O layer)
#[async_trait]
pub trait ModelService: Send + Sync {
    async fn generate_response(&self, input: &str) -> EvalResult<String>;
    async fn get_model_info(&self) -> EvalResult<ModelInfo>;
}
