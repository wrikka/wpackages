//! services/memory_consolidator.rs

use crate::services::LlmBatcher;
use crate::types::consolidation::ConsolidatedInsight;
use ai_memories::Memory;

/// A service that consolidates memories from multiple agents into unified insights.
#[derive(Clone)]
pub struct MemoryConsolidator {
    llm_batcher: LlmBatcher,
}

impl MemoryConsolidator {
    pub fn new(llm_batcher: LlmBatcher) -> Self {
        Self { llm_batcher }
    }

    /// Analyzes memories from multiple agents and generates a list of consolidated insights.
    pub async fn consolidate(&self, memories: Vec<Vec<Memory>>) -> Vec<ConsolidatedInsight> {
        let all_memories_content: Vec<String> = memories
            .into_iter()
            .flatten()
            .map(|m| m.content.to_string())
            .collect();

        let prompt = format!(
            "Analyze the following memories from multiple agents and provide a summary of key insights:\n\n{}",
            all_memories_content.join("\n---\n")
        );

        // In a real implementation, this would use the LLM to generate insights.
        // let response = self.llm_batcher.request(...).await;
        // let insights = parse_insights_from_response(response);

        // For now, return a hardcoded insight.
        vec![ConsolidatedInsight {
            insight: "Placeholder Insight: All agents seem to be focused on a similar topic.".to_string(),
            supporting_memories: vec![],
        }]
    }
}
