use crate::common::Error;
use async_trait::async_trait;

/// The core trait for any language model integration.
#[async_trait]
pub trait LanguageModel: Send + Sync {
    /// Generates a response based on a given prompt.
    async fn generate(&self, prompt: &str) -> Result<String, Error>;
}

/// A mock language model for testing and development that can handle various prompt types.
#[derive(Default)]
pub struct MockLLM;

impl MockLLM {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl LanguageModel for MockLLM {
    async fn generate(&self, prompt: &str) -> Result<String, Error> {
        // This mock simulates the behavior of a real LLM for different components.
        let lower_prompt = prompt.to_lowercase();

        if lower_prompt.contains("as an impartial evaluator") {
            // --- Evaluator Prompt ---
            // If the trace contains a final answer, evaluate it as sufficient.
            if lower_prompt.contains("\"Finish\"") {
                Ok(r#"{
                    "objective_scores": { "correctness": 1.0, "completeness": 1.0, "cost": 0.5 },
                    "feedback": null,
                    "is_sufficient": true
                }"#.to_string())
            } else {
                // Otherwise, ask for a final answer.
                Ok(r#"{
                    "objective_scores": { "correctness": 0.7, "completeness": 0.7, "cost": 0.2 },
                    "feedback": "The information has been gathered, but a final answer has not been synthesized.",
                    "is_sufficient": false
                }"#.to_string())
            }
        } else if lower_prompt.contains("you are the planner") {
            // --- Planner Prompt ---
            if lower_prompt.contains("observation": { "Tool") {
                 // If the last action was a tool call, the next action should be to finish.
                Ok(r#"{
                    "Finish": {
                        "result": "The final answer based on the tool output."
                    }
                }"#.to_string())
            } else {
                // Default first action is to search.
                Ok(r#"{
                    "CallTool": {
                        "tool_name": "WebSearch",
                        "input": {
                            "query": "What is the user asking about?"
                        }
                    }
                }"#.to_string())
            }
        } else {
            // --- Default/Strategy Prompt ---
            Ok(format!("A generic but thoughtful response to the prompt: '{}'", prompt))
        }
    }
}
