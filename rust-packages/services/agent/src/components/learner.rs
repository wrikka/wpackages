//! components/learner.rs

use crate::services::{LlmBatcher, ToolRegistry};
use crate::templates::basic::{BasicExecutionResult, BasicState};
use crate::types::correction::Outcome;
use crate::types::traits::Learner;
use async_trait::async_trait;

/// A learner that updates the agent's state based on the outcome of an action.
#[derive(Clone, Default)]
pub struct CorrectiveLearner;

impl CorrectiveLearner {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl Learner<BasicState, BasicExecutionResult, LlmBatcher, ToolRegistry> for CorrectiveLearner {
    /// If the action failed, records the error in the agent's state.
    async fn learn(
        &self,
        state: &mut BasicState,
        execution_result: &BasicExecutionResult,
        _batcher: &LlmBatcher,
        _registry: &ToolRegistry,
    ) {
        if let Outcome::Failure { error } = &execution_result.outcome {
            println!("Learning from failure: {}", error);
            state.last_result = format!("Previous action failed: {}", error);
        } else {
            state.last_result = "Previous action was successful.".to_string();
        }
    }
}
