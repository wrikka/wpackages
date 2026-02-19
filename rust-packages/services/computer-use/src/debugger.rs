//! AI-Powered Debugging
//!
//! Feature 11: Intelligent debugging and error analysis

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::{Error, Result};
use crate::types::Action;

/// Debug analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugAnalysis {
    pub error_type: String,
    pub root_cause: String,
    pub suggestions: Vec<DebugSuggestion>,
    pub related_errors: Vec<String>,
    pub fix_confidence: f32,
}

/// Debug suggestion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugSuggestion {
    pub description: String,
    pub action: Option<Action>,
    pub priority: u8,
    pub auto_fixable: bool,
}

/// Error pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorPattern {
    pub pattern: String,
    pub category: ErrorCategory,
    pub common_causes: Vec<String>,
    pub fixes: Vec<String>,
}

/// Error category
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ErrorCategory {
    Network,
    Permission,
    Timeout,
    NotFound,
    InvalidInput,
    System,
    Unknown,
}

/// AI Debugger
pub struct AIDebugger {
    patterns: Vec<ErrorPattern>,
    error_history: HashMap<String, u32>,
}

impl AIDebugger {
    /// Create new AI debugger
    pub fn new() -> Self {
        Self {
            patterns: Self::default_patterns(),
            error_history: HashMap::new(),
        }
    }

    /// Default error patterns
    fn default_patterns() -> Vec<ErrorPattern> {
        vec![
            ErrorPattern {
                pattern: "not found".to_string(),
                category: ErrorCategory::NotFound,
                common_causes: vec![
                    "Element changed or removed".to_string(),
                    "Timing issue - element not loaded yet".to_string(),
                    "Wrong selector".to_string(),
                ],
                fixes: vec![
                    "Wait for element to appear".to_string(),
                    "Take a new snapshot".to_string(),
                    "Update selector".to_string(),
                ],
            },
            ErrorPattern {
                pattern: "timeout".to_string(),
                category: ErrorCategory::Timeout,
                common_causes: vec![
                    "Slow network".to_string(),
                    "Heavy load on system".to_string(),
                    "Operation taking too long".to_string(),
                ],
                fixes: vec![
                    "Increase timeout".to_string(),
                    "Retry operation".to_string(),
                    "Check system resources".to_string(),
                ],
            },
            ErrorPattern {
                pattern: "permission denied".to_string(),
                category: ErrorCategory::Permission,
                common_causes: vec![
                    "Insufficient privileges".to_string(),
                    "File locked by another process".to_string(),
                    "Security policy blocking action".to_string(),
                ],
                fixes: vec![
                    "Run as administrator".to_string(),
                    "Close conflicting applications".to_string(),
                    "Adjust security settings".to_string(),
                ],
            },
        ]
    }

    /// Analyze an error
    pub fn analyze(&mut self, error: &Error, action: Option<&Action>) -> DebugAnalysis {
        let error_str = error.to_string();
        
        // Track error frequency
        *self.error_history.entry(error_str.clone()).or_insert(0) += 1;

        // Find matching pattern
        let pattern = self.patterns.iter()
            .find(|p| error_str.to_lowercase().contains(&p.pattern.to_lowercase()));

        let (category, suggestions) = if let Some(p) = pattern {
            let suggestions = p.fixes.iter()
                .enumerate()
                .map(|(i, fix)| DebugSuggestion {
                    description: fix.clone(),
                    action: self.fix_to_action(fix, action),
                    priority: (i + 1) as u8,
                    auto_fixable: self.is_auto_fixable(fix),
                })
                .collect();

            (p.category.clone(), suggestions)
        } else {
            (ErrorCategory::Unknown, vec![
                DebugSuggestion {
                    description: "Take a snapshot to analyze current state".to_string(),
                    action: Some(Action::Snapshot),
                    priority: 1,
                    auto_fixable: true,
                },
            ])
        };

        DebugAnalysis {
            error_type: error_str.clone(),
            root_cause: self.determine_root_cause(&error_str, &category),
            suggestions,
            related_errors: self.find_related_errors(&error_str),
            fix_confidence: self.calculate_confidence(&error_str),
        }
    }

    /// Convert fix description to action
    fn fix_to_action(&self, fix: &str, _original_action: Option<&Action>) -> Option<Action> {
        let fix_lower = fix.to_lowercase();
        if fix_lower.contains("snapshot") {
            Some(Action::Snapshot)
        } else if fix_lower.contains("wait") {
            Some(Action::WaitForElement)
        } else {
            None
        }
    }

    /// Check if fix is auto-fixable
    fn is_auto_fixable(&self, fix: &str) -> bool {
        let fix_lower = fix.to_lowercase();
        fix_lower.contains("snapshot")
            || fix_lower.contains("retry")
            || fix_lower.contains("wait")
    }

    /// Determine root cause
    fn determine_root_cause(&self, error: &str, category: &ErrorCategory) -> String {
        match category {
            ErrorCategory::NotFound => "Target element or resource does not exist or is not visible".to_string(),
            ErrorCategory::Timeout => "Operation exceeded allowed time limit".to_string(),
            ErrorCategory::Permission => "Insufficient permissions to perform action".to_string(),
            ErrorCategory::Network => "Network connectivity issue".to_string(),
            ErrorCategory::InvalidInput => "Invalid input parameters provided".to_string(),
            ErrorCategory::System => "System-level error occurred".to_string(),
            ErrorCategory::Unknown => "Unknown error - requires manual investigation".to_string(),
        }
    }

    /// Find related errors
    fn find_related_errors(&self, error: &str) -> Vec<String> {
        self.error_history
            .iter()
            .filter(|(k, _)| k != &error && self.is_related(error, k))
            .map(|(k, _)| k.clone())
            .collect()
    }

    /// Check if errors are related
    fn is_related(&self, error1: &str, error2: &str) -> bool {
        let words1: Vec<&str> = error1.split_whitespace().collect();
        let words2: Vec<&str> = error2.split_whitespace().collect();
        
        words1.iter().any(|w| words2.contains(w))
    }

    /// Calculate fix confidence
    fn calculate_confidence(&self, error: &str) -> f32 {
        let count = self.error_history.get(error).copied().unwrap_or(0);
        if count == 0 {
            0.5
        } else if count < 3 {
            0.7
        } else if count < 10 {
            0.85
        } else {
            0.95
        }
    }

    /// Get error statistics
    pub fn stats(&self) -> HashMap<String, u32> {
        self.error_history.clone()
    }
}

impl Default for AIDebugger {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyze_not_found_error() {
        let mut debugger = AIDebugger::new();
        let error = Error::ElementNotFound { selector: "test".to_string() };
        let analysis = debugger.analyze(&error, None);
        
        assert_eq!(analysis.category, ErrorCategory::NotFound);
        assert!(!analysis.suggestions.is_empty());
    }

    #[test]
    fn test_error_tracking() {
        let mut debugger = AIDebugger::new();
        let error = Error::Timeout { seconds: 10 };
        
        debugger.analyze(&error, None);
        debugger.analyze(&error, None);
        
        let stats = debugger.stats();
        assert!(stats.values().any(|&v| v >= 2));
    }
}
