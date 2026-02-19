use crate::common::{Error, ReasoningInput, ReasoningOutput};
use crate::core::ReasoningStrategy;
use crate::llm::{LanguageModel, MockLLM};
use async_trait::async_trait;

/// A reasoning strategy that mimics a step-by-step thinking process.
pub struct ChainOfThoughtStrategy {
    llm: Box<dyn LanguageModel>,
}

impl ChainOfThoughtStrategy {
    pub fn new() -> Self {
        Self { llm: Box::new(MockLLM::new()) }
    }

    // Allows injecting a specific LLM, useful for testing or different backends.
    pub fn with_llm(llm: Box<dyn LanguageModel>) -> Self {
        Self { llm }
    }
}

#[async_trait]
impl ReasoningStrategy for ChainOfThoughtStrategy {
    fn name(&self) -> &str {
        "ChainOfThoughtStrategy"
    }

    async fn reason(&self, input: &ReasoningInput) -> Result<ReasoningOutput, Error> {
        if input.query.is_empty() {
            return Err(Error::InvalidInput("Query cannot be empty".to_string()));
        }

        // --- Dynamic Chain of Thought Process using an LLM ---
        let mut thought_process = String::from("Thought Process:\n");

        // Step 1: Deconstruct the query
        let prompt1 = format!("Deconstruct the following query into its key components: '{}'", input.query);
        let step1_result = self.llm.generate(&prompt1).await?;
        thought_process.push_str(&format!("1. Deconstruction: {}\n", step1_result));

        // Step 2: Formulate a plan
        let prompt2 = format!("Based on the components '{}', create a step-by-step plan to answer the query.", step1_result);
        let step2_result = self.llm.generate(&prompt2).await?;
        thought_process.push_str(&format!("2. Plan: {}\n", step2_result));

        // Step 3: Synthesize the final answer
        let prompt3 = format!("Following the plan '{}', synthesize the final answer.", step2_result);
        let final_answer = self.llm.generate(&prompt3).await?;
        thought_process.push_str(&format!("---\nFinal Answer: {}", final_answer));

        Ok(ReasoningOutput { result: thought_process })
    }
}
