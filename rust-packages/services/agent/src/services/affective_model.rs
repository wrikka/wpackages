//! services/affective_model.rs

use crate::services::LlmBatcher;
use crate::types::affective::EmotionalState;
use std::collections::HashMap;

/// A service that analyzes text to infer the emotional state of the user.
#[derive(Clone)]
pub struct AffectiveModel {
    llm_batcher: LlmBatcher,
}

impl AffectiveModel {
    pub fn new(llm_batcher: LlmBatcher) -> Self {
        Self { llm_batcher }
    }

    /// Analyzes a string of text and returns a predicted `EmotionalState`.
    /// This is a simplified implementation.
    pub async fn analyze_text(&self, text: &str) -> EmotionalState {
        let prompt = format!(
            "Analyze the emotional content of the following text and return a JSON object with emotions and their intensities (0.0 to 1.0):\n\n{}",
            text
        );

        // In a real implementation, this would use an LLM specialized for sentiment analysis.
        // let response = self.llm_batcher.request(...).await;
        // let emotional_state = parse_emotions_from_response(response);

        // For now, return a hardcoded emotional state based on keywords.
        let mut emotions = HashMap::new();
        if text.to_lowercase().contains("happy") || text.to_lowercase().contains("great") {
            emotions.insert("joy".to_string(), 0.9);
        } else if text.to_lowercase().contains("sad") || text.to_lowercase().contains("disappointed") {
            emotions.insert("sadness".to_string(), 0.8);
        }

        EmotionalState { emotions }
    }
}
