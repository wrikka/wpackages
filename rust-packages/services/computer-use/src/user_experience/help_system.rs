//! Feature 34: Intelligent Help & Suggestions

use crate::types::*;

/// Feature 34: Intelligent Help & Suggestions
#[derive(Default)]
pub struct HelpSystem {
    suggestions: Vec<Suggestion>,
}

impl HelpSystem {
    /// Suggest optimizations
    pub fn suggest_optimizations(&self, task: &Task) -> Vec<Suggestion> {
        let mut suggestions = vec![];
        if task.description.to_lowercase().contains("repeat") {
            suggestions.push(Suggestion {
                text: "Consider creating a reusable workflow for repeated tasks.".to_string(),
                confidence: 0.8,
            });
        }
        suggestions
    }

    /// Provide contextual help
    pub fn provide_help(&self, context: &str) -> HelpContent {
        HelpContent {
            content: format!("Help for: {}", context),
        }
    }

    /// Offer shortcuts
    pub fn offer_shortcuts(&self, _action: &str) -> Vec<Shortcut> {
        vec![]
    }
}
