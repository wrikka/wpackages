//! Core types for AI safety

use serde::{Deserialize, Serialize};

/// Safety check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafetyResult {
    pub is_safe: bool,
    pub confidence: f64,
    pub violations: Vec<SafetyViolation>,
    pub action: SafetyAction,
}

/// Safety violation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafetyViolation {
    pub category: SafetyCategory,
    pub severity: Severity,
    pub description: String,
    pub location: Option<TextLocation>,
}

/// Safety categories
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SafetyCategory {
    HarmfulContent,
    HateSpeech,
    SexualContent,
    Violence,
    SelfHarm,
    PiiLeak,
    PromptInjection,
    Jailbreak,
    ToxicContent,
    Misinformation,
}

/// Severity levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

/// Safety actions
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SafetyAction {
    Allow,
    Warn,
    Block,
    Escalate,
}

/// Text location for violations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextLocation {
    pub start: usize,
    pub end: usize,
    pub text: String,
}

impl Default for SafetyResult {
    fn default() -> Self {
        Self {
            is_safe: true,
            confidence: 1.0,
            violations: Vec::new(),
            action: SafetyAction::Allow,
        }
    }
}
