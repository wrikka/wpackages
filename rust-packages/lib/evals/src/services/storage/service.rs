//! Storage service trait

use async_trait::async_trait;
use crate::error::{EvalError, EvalResult};
use crate::types::results::EvalResult as FullEvalResult;

/// Trait for storage operations (I/O layer)
#[async_trait]
pub trait StorageService: Send + Sync {
    async fn save_evaluation_result(&self, result: &FullEvalResult) -> EvalResult<()>;
    async fn load_evaluation_result(&self, eval_id: &str) -> EvalResult<FullEvalResult>;
    async fn list_evaluations(&self) -> EvalResult<Vec<EvalSummary>>;
    async fn delete_evaluation(&self, eval_id: &str) -> EvalResult<()>;
}
