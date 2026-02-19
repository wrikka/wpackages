//! Content moderation

use serde::{Deserialize, Serialize};

use crate::{SafetyCategory, Severity};

/// Moderation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationResult {
    pub flagged: bool,
    pub categories: Vec<ModerationCategory>,
    pub category_scores: std::collections::HashMap<String, f64>,
}

/// Moderation category with score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationCategory {
    pub category: SafetyCategory,
    pub score: f64,
    pub severity: Severity,
}

impl ModerationCategory {
    pub fn new(category: SafetyCategory, score: f64) -> Self {
        let severity = if score >= 0.8 {
            Severity::Critical
        } else if score >= 0.6 {
            Severity::High
        } else if score >= 0.4 {
            Severity::Medium
        } else {
            Severity::Low
        };

        Self {
            category,
            score,
            severity,
        }
    }
}

impl ModerationResult {
    pub fn safe() -> Self {
        Self {
            flagged: false,
            categories: Vec::new(),
            category_scores: std::collections::HashMap::new(),
        }
    }

    pub fn flagged(categories: Vec<ModerationCategory>) -> Self {
        let category_scores = categories
            .iter()
            .map(|c| (format!("{:?}", c.category), c.score))
            .collect();

        Self {
            flagged: true,
            categories,
            category_scores,
        }
    }
}
