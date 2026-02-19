//! Feature 33: Personalized Workflow Learning

use crate::types::*;
use std::collections::HashMap;

/// Feature 33: Personalized Workflow Learning
#[derive(Default)]
pub struct Personalization {
    user_preferences: HashMap<String, String>,
    learned_patterns: Vec<Pattern>,
}

impl Personalization {
    /// Learn user preferences
    pub fn learn_preferences(&mut self, preferences: HashMap<String, String>) {
        self.user_preferences.extend(preferences);
    }

    /// Adapt to individual workflows
    pub fn adapt_workflow(&self, workflow: &Workflow) -> Workflow {
        let mut adapted_workflow = workflow.clone();

        if self.user_preferences.get("fast_mode").map_or(false, |v| v == "true") {
            // If in fast mode, remove wait actions
            adapted_workflow.actions.retain(|action| !matches!(action, Action::Wait { .. }));
        }

        adapted_workflow
    }

    /// Remember custom patterns
    pub fn remember_pattern(&mut self, pattern: Pattern) {
        self.learned_patterns.push(pattern);
    }
}
