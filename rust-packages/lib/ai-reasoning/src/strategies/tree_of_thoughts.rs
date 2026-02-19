use crate::common::{Error, ReasoningInput, ReasoningOutput};
use crate::core::ReasoningStrategy;
use crate::llm::{LanguageModel, MockLLM};
use async_trait::async_trait;

/// Represents a node in the tree of thoughts.
#[derive(Debug, Clone)]
struct ThoughtNode {
    thought: String,
    evaluation_score: f32,
}

/// A reasoning strategy that explores multiple branches of thought.
pub struct TreeOfThoughtsStrategy {
    llm: Box<dyn LanguageModel>,
    num_branches: u32,
}

impl TreeOfThoughtsStrategy {
    pub fn new() -> Self {
        Self {
            llm: Box::new(MockLLM::new()),
            num_branches: 3, // Default to exploring 3 branches
        }
    }

    pub fn with_llm(llm: Box<dyn LanguageModel>) -> Self {
        Self {
            llm,
            num_branches: 3,
        }
    }
}

#[async_trait]
impl ReasoningStrategy for TreeOfThoughtsStrategy {
    fn name(&self) -> &str {
        "TreeOfThoughtsStrategy"
    }

    async fn reason(&self, input: &ReasoningInput) -> Result<ReasoningOutput, Error> {
        if input.query.is_empty() {
            return Err(Error::InvalidInput("Query cannot be empty".to_string()));
        }

        // --- Dynamic Tree of Thoughts Process ---
        // 1. Generate initial thoughts (branches)
        let mut thoughts = Vec::new();
        for i in 0..self.num_branches {
            let prompt = format!("Given the query '{}', generate a diverse and creative initial thought or approach (Approach #{})", input.query, i + 1);
            let thought_text = self.llm.generate(&prompt).await?;
            thoughts.push(ThoughtNode { thought: thought_text, evaluation_score: 0.0 });
        }

        // 2. Evaluate each thought
        for thought in &mut thoughts {
            let prompt = format!("Evaluate the following thought on a scale of 0.0 to 1.0 for its potential to solve the query '{}': Thought: '{}'", input.query, thought.thought);
            let score_text = self.llm.generate(&prompt).await?;
            // In a real implementation, this would parse the score more robustly.
            thought.evaluation_score = score_text.trim().parse::<f32>().unwrap_or(0.5);
        }

        // 3. Select the best thought
        let best_thought = thoughts.into_iter()
            .max_by(|a, b| a.evaluation_score.partial_cmp(&b.evaluation_score).unwrap_or(std::cmp::Ordering::Equal))
            .ok_or_else(|| Error::ProcessingError("Failed to select a best thought".to_string()))?;

        let result = format!(
            "Tree of Thoughts Exploration:\n- Best path found with score: {}\n- Winning Thought: '{}'",
            best_thought.evaluation_score, best_thought.thought
        );

        Ok(ReasoningOutput { result })
    }
}
