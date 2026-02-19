use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SuggestionType {
    Tool,
    Resource,
    Prompt,
    Method,
    Property,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Suggestion {
    pub text: String,
    pub suggestion_type: SuggestionType,
    pub priority: f64,
    pub metadata: Option<serde_json::Value>,
}

pub struct SuggestionEngine {
    suggestions: HashMap<String, Vec<Suggestion>>,
}

impl SuggestionEngine {
    pub fn new() -> Self {
        Self {
            suggestions: HashMap::new(),
        }
    }

    pub fn register_suggestions(&mut self, context: String, suggestions: Vec<Suggestion>) {
        self.suggestions.insert(context, suggestions);
    }

    pub async fn get_suggestions(&self, context: &str, query: &str) -> Vec<Suggestion> {
        let mut all_suggestions = Vec::new();

        if let Some(context_suggestions) = self.suggestions.get(context) {
            for suggestion in context_suggestions {
                if suggestion.text.to_lowercase().contains(&query.to_lowercase()) {
                    all_suggestions.push(suggestion.clone());
                }
            }
        }

        all_suggestions.sort_by(|a, b| b.priority.partial_cmp(&a.priority).unwrap_or(std::cmp::Ordering::Equal));

        all_suggestions
    }

    pub async fn get_type_ahead(&self, prefix: &str) -> Vec<String> {
        let mut results = Vec::new();

        for suggestions in self.suggestions.values() {
            for suggestion in suggestions {
                if suggestion.text.starts_with(prefix) {
                    results.push(suggestion.text.clone());
                }
            }
        }

        results.sort();
        results.dedup();

        results
    }
}
