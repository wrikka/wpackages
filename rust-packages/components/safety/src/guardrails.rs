//! Guardrails for AI safety

use async_trait::async_trait;

use crate::{SafetyAction, SafetyCategory, SafetyResult, SafetyViolation, Severity};

/// Safety configuration
#[derive(Debug, Clone)]
pub struct SafetyConfig {
    pub enabled_categories: Vec<SafetyCategory>,
    pub min_severity: Severity,
    pub block_on_violation: bool,
    pub log_violations: bool,
}

impl Default for SafetyConfig {
    fn default() -> Self {
        Self {
            enabled_categories: vec![
                SafetyCategory::HarmfulContent,
                SafetyCategory::HateSpeech,
                SafetyCategory::Violence,
                SafetyCategory::SelfHarm,
                SafetyCategory::PromptInjection,
            ],
            min_severity: Severity::Low,
            block_on_violation: true,
            log_violations: true,
        }
    }
}

/// Guardrail trait
#[async_trait]
pub trait Guardrail: Send + Sync {
    fn name(&self) -> &str;
    fn category(&self) -> SafetyCategory;
    
    async fn check(&self, input: &str) -> GuardrailResult;
}

/// Guardrail result
#[derive(Debug, Clone)]
pub struct GuardrailResult {
    pub passed: bool,
    pub confidence: f64,
    pub violations: Vec<SafetyViolation>,
}

impl GuardrailResult {
    pub fn pass() -> Self {
        Self {
            passed: true,
            confidence: 1.0,
            violations: Vec::new(),
        }
    }

    pub fn fail(category: SafetyCategory, severity: Severity, description: String) -> Self {
        Self {
            passed: false,
            confidence: 0.9,
            violations: vec![SafetyViolation {
                category,
                severity,
                description,
                location: None,
            }],
        }
    }
}

/// Composite guardrail that runs multiple checks
pub struct CompositeGuardrail {
    guardrails: Vec<Box<dyn Guardrail>>,
    config: SafetyConfig,
}

impl CompositeGuardrail {
    pub fn new(config: SafetyConfig) -> Self {
        Self {
            guardrails: Vec::new(),
            config,
        }
    }

    pub fn add<G: Guardrail + 'static>(mut self, guardrail: G) -> Self {
        self.guardrails.push(Box::new(guardrail));
        self
    }

    pub async fn check_all(&self, input: &str) -> SafetyResult {
        let mut all_violations = Vec::new();
        let mut min_confidence = 1.0;

        for guardrail in &self.guardrails {
            if !self.config.enabled_categories.contains(&guardrail.category()) {
                continue;
            }

            let result = guardrail.check(input).await;
            if !result.passed {
                min_confidence = min_confidence.min(result.confidence);
                all_violations.extend(result.violations);
            }
        }

        let is_safe = all_violations.is_empty();
        let action = determine_action(&all_violations, &self.config);

        SafetyResult {
            is_safe,
            confidence: min_confidence,
            violations: all_violations,
            action,
        }
    }
}

fn determine_action(violations: &[SafetyViolation], config: &SafetyConfig) -> SafetyAction {
    if violations.is_empty() {
        return SafetyAction::Allow;
    }

    let max_severity = violations
        .iter()
        .map(|v| v.severity)
        .max()
        .unwrap_or(Severity::Low);

    if config.block_on_violation && max_severity >= Severity::Medium {
        SafetyAction::Block
    } else if max_severity >= Severity::High {
        SafetyAction::Escalate
    } else {
        SafetyAction::Warn
    }
}
