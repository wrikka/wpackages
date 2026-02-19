//! Content filtering

use regex::Regex;

use crate::{Guardrail, GuardrailResult, SafetyCategory, Severity};

/// Content filter rule
pub struct FilterRule {
    pub name: String,
    pub category: SafetyCategory,
    pub severity: Severity,
    pub patterns: Vec<Regex>,
}

impl FilterRule {
    pub fn new(
        name: impl Into<String>,
        category: SafetyCategory,
        severity: Severity,
        patterns: Vec<&str>,
    ) -> Self {
        Self {
            name: name.into(),
            category,
            severity,
            patterns: patterns
                .into_iter()
                .filter_map(|p| Regex::new(p).ok())
                .collect(),
        }
    }

    pub fn check(&self, text: &str) -> Option<String> {
        for pattern in &self.patterns {
            if pattern.is_match(text) {
                return Some(format!("Matched rule: {}", self.name));
            }
        }
        None
    }
}

/// Content filter guardrail
pub struct ContentFilter {
    rules: Vec<FilterRule>,
}

impl ContentFilter {
    pub fn new(rules: Vec<FilterRule>) -> Self {
        Self { rules }
    }

    pub fn default_rules() -> Self {
        Self::new(vec![
            // Example rules - customize as needed
            FilterRule::new(
                "profanity",
                SafetyCategory::ToxicContent,
                Severity::Medium,
                vec![],
            ),
            FilterRule::new(
                "pii_pattern",
                SafetyCategory::PiiLeak,
                Severity::High,
                vec![
                    r"\b\d{3}-\d{2}-\d{4}\b", // SSN pattern
                    r"\b\d{16}\b",            // Credit card
                ],
            ),
        ])
    }
}

#[async_trait::async_trait]
impl Guardrail for ContentFilter {
    fn name(&self) -> &str {
        "content_filter"
    }

    fn category(&self) -> SafetyCategory {
        SafetyCategory::HarmfulContent
    }

    async fn check(&self, input: &str) -> GuardrailResult {
        for rule in &self.rules {
            if let Some(description) = rule.check(input) {
                return GuardrailResult::fail(rule.category, rule.severity, description);
            }
        }
        GuardrailResult::pass()
    }
}
