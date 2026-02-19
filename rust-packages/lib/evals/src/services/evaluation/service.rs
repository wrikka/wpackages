//! Evaluation service trait

use async_trait::async_trait;
use crate::error::{EvalError, EvalResult};
use crate::types::config::EvalConfig;
use crate::types::results::EvalResult as FullEvalResult;

/// Trait for evaluation operations (I/O layer)
#[async_trait]
pub trait EvaluationService: Send + Sync {
    async fn run_evaluation(&self, config: EvalConfig) -> EvalResult<FullEvalResult>;
    async fn cancel_evaluation(&self, eval_id: &crate::types::core::EvalId) -> EvalResult<()>;
    async fn get_evaluation_status(&self, eval_id: &crate::types::core::EvalId) -> EvalResult<crate::types::core::EvalStatus>;
}
