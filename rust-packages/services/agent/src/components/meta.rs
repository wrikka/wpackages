//! components/meta.rs

use crate::templates::basic::BasicInput;
use crate::types::multimodal::Content;
use crate::types::reasoning::ReasoningStrategy;
use async_trait::async_trait;

/// A trait for meta-cognitive components that select a reasoning strategy.
#[async_trait]
pub trait MetaCognitive: Send + Sync {
    /// Selects the most appropriate reasoning strategy based on the input and state.
    async fn select_strategy(&self, input: &dyn std::any::Any, state: &dyn std::any::Any) -> ReasoningStrategy;
}

/// A simple meta-cognitive component that always chooses a default strategy.
#[derive(Clone, Default)]
pub struct DefaultMetaCognitive {
    default_strategy: ReasoningStrategy,
}

impl DefaultMetaCognitive {
    pub fn new(default_strategy: ReasoningStrategy) -> Self {
        Self { default_strategy }
    }
}

#[async_trait]
impl MetaCognitive for DefaultMetaCognitive {
    async fn select_strategy(&self, input: &dyn std::any::Any, _state: &dyn std::any::Any) -> ReasoningStrategy {
        if let Some(basic_input) = input.downcast_ref::<BasicInput>() {
            let goal = basic_input.content.iter().map(|c| match c {
                Content::Text(text) => text.clone(),
                _ => "".to_string(),
            }).collect::<Vec<_>>().join("\n").to_lowercase();

            if goal.contains("plan") || goal.contains("develop") || goal.contains("create") {
                return ReasoningStrategy::HierarchicalPlanning;
            }
            if goal.contains("execute") || goal.contains("run") || goal.contains("do") {
                return ReasoningStrategy::SimpleExecution;
            }
        }
        ReasoningStrategy::ReAct
    }
}
