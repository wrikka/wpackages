//! # The LLM-Driven Planner
//! This module is responsible for deciding the next best action for the agent to take.
//! It uses a Language Model to analyze the current state and determine the most logical next step.

use crate::common::Error;
use crate::formalism::{Action, State};
use crate::llm::{LanguageModel, MockLLM};
use async_trait::async_trait;
use prompt::{PromptRegistry, PromptTemplate, PromptBuilder};
use serde_json::json;

/// The core trait for any planning system.
#[async_trait]
pub trait Planner: Send + Sync {
    /// Decides the next single action to take based on the current state of the reasoning process.
    async fn decide_next_action(&self, state: &State) -> Result<Action, Error>;
}

/// A planner that uses a Language Model to make decisions.
pub struct LlmPlanner {
    llm: Box<dyn LanguageModel>,
    registry: PromptRegistry,
}

impl LlmPlanner {
    pub fn new() -> Self {
        let mut registry = PromptRegistry::new();
        registry.register(PromptTemplate::new(
            "planner",
            "You are the planner for a reasoning agent. Your goal is to solve the user's query: '{{query}}'.\n\n\
             Here is the current state and execution trace:\n{{state_json}}\n\n\
             Based on this, what is the single next best action to take? \
             Your available actions are CallTool, InvokeStrategy, or Finish. \
             Respond with only a single JSON object representing the action."
        ).with_system("You are a helpful reasoning assistant."));

        Self { 
            llm: Box::new(MockLLM::new()),
            registry,
        }
    }
}

#[async_trait]
impl Planner for LlmPlanner {
    async fn decide_next_action(&self, state: &State) -> Result<Action, Error> {
        let state_json = serde_json::to_string_pretty(state).unwrap_or_default();

        let prompt_content = PromptBuilder::new(&self.registry, "planner")
            .var("query", state.initial_query.clone())
            .var("state_json", state_json)
            .build()
            .map_err(|e| Error::ProcessingError(format!("Failed to build planner prompt: {}", e)))?;

        // Combine system and user prompt for the mock LLM
        let full_prompt = format!(
            "{}\n\n{}",
            prompt_content.system.unwrap_or_default(),
            prompt_content.user
        );

        let llm_response = self.llm.generate(&full_prompt).await?;

        // In a real system, this parsing would be more robust, with retries and error handling.
        let action: Action = serde_json::from_str(&llm_response)
            .map_err(|e| Error::ProcessingError(format!("Planner failed to parse action from LLM: {}", e)))?;

        Ok(action)
    }
}

// We will need to update the MockLLM to handle planner prompts and return valid Action JSON.
// Example mock response:
// {
//   "CallTool": {
//     "tool_name": "WebSearch",
//     "input": { "query": "What is Control Theory?" }
//   }
// }

