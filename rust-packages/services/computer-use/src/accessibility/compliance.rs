//! Accessibility Compliance Checker
//!
//! WCAG/ADA compliance checking during automation.

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Accessibility compliance checker
pub struct AccessibilityChecker {
    rules: Arc<Mutex<Vec<AccessibilityRule>>>,
    issues: Arc<Mutex<Vec<AccessibilityIssue>>>,
    standards: Arc<Mutex<ComplianceStandards>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessibilityRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub wcag_level: WcagLevel,
    pub category: IssueCategory,
    pub check_fn: String, // Function identifier
    pub severity: Severity,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum WcagLevel {
    A,
    AA,
    AAA,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum IssueCategory {
    Perceivable,
    Operable,
    Understandable,
    Robust,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Severity {
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessibilityIssue {
    pub rule_id: String,
    pub rule_name: String,
    pub description: String,
    pub element: Option<ElementReference>,
    pub severity: Severity,
    pub wcag_level: WcagLevel,
    pub wcag_criterion: String,
    pub suggestion: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementReference {
    pub element_id: String,
    pub element_type: String,
    pub element_name: Option<String>,
    pub location: (i32, i32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceStandards {
    pub wcag_version: String,
    pub target_level: WcagLevel,
    pub ada_compliant: bool,
    pub section508_compliant: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub timestamp: u64,
    pub total_issues: usize,
    pub errors: usize,
    pub warnings: usize,
    pub info: usize,
    pub wcag_a_issues: usize,
    pub wcag_aa_issues: usize,
    pub wcag_aaa_issues: usize,
    pub issues_by_category: HashMap<IssueCategory, usize>,
    pub issues: Vec<AccessibilityIssue>,
    pub score: f64, // 0-100 compliance score
}

impl AccessibilityChecker {
    pub fn new() -> Self {
        let mut rules = vec![];
        
        // Add built-in rules
        rules.push(AccessibilityRule {
            id: "alt-text".to_string(),
            name: "Missing Alt Text".to_string(),
            description: "Images must have alternative text".to_string(),
            wcag_level: WcagLevel::A,
            category: IssueCategory::Perceivable,
            check_fn: "check_alt_text".to_string(),
            severity: Severity::Error,
        });
        
        rules.push(AccessibilityRule {
            id: "color-contrast".to_string(),
            name: "Color Contrast".to_string(),
            description: "Text must have sufficient contrast ratio".to_string(),
            wcag_level: WcagLevel::AA,
            category: IssueCategory::Perceivable,
            check_fn: "check_contrast".to_string(),
            severity: Severity::Error,
        });
        
        rules.push(AccessibilityRule {
            id: "keyboard-nav".to_string(),
            name: "Keyboard Navigation".to_string(),
            description: "Interactive elements must be keyboard accessible".to_string(),
            wcag_level: WcagLevel::A,
            category: IssueCategory::Operable,
            check_fn: "check_keyboard_nav".to_string(),
            severity: Severity::Error,
        });
        
        rules.push(AccessibilityRule {
            id: "focus-visible".to_string(),
            name: "Focus Visibility".to_string(),
            description: "Focus indicator must be visible".to_string(),
            wcag_level: WcagLevel::AA,
            category: IssueCategory::Operable,
            check_fn: "check_focus_visible".to_string(),
            severity: Severity::Warning,
        });
        
        rules.push(AccessibilityRule {
            id: "form-labels".to_string(),
            name: "Form Labels".to_string(),
            description: "Form inputs must have labels".to_string(),
            wcag_level: WcagLevel::A,
            category: IssueCategory::Perceivable,
            check_fn: "check_form_labels".to_string(),
            severity: Severity::Error,
        });
        
        rules.push(AccessibilityRule {
            id: "heading-structure".to_string(),
            name: "Heading Structure".to_string(),
            description: "Headings must follow logical hierarchy".to_string(),
            wcag_level: WcagLevel::A,
            category: IssueCategory::Perceivable,
            check_fn: "check_headings".to_string(),
            severity: Severity::Warning,
        });
        
        rules.push(AccessibilityRule {
            id: "link-purpose".to_string(),
            name: "Link Purpose".to_string(),
            description: "Links must have descriptive text".to_string(),
            wcag_level: WcagLevel::A,
            category: IssueCategory::Operable,
            check_fn: "check_link_text".to_string(),
            severity: Severity::Warning,
        });
        
        rules.push(AccessibilityRule {
            id: "language".to_string(),
            name: "Language Attribute".to_string(),
            description: "Page must have valid language attribute".to_string(),
            wcag_level: WcagLevel::A,
            category: IssueCategory::Understandable,
            check_fn: "check_language".to_string(),
            severity: Severity::Error,
        });

        Self {
            rules: Arc::new(Mutex::new(rules)),
            issues: Arc::new(Mutex::new(vec![])),
            standards: Arc::new(Mutex::new(ComplianceStandards {
                wcag_version: "2.1".to_string(),
                target_level: WcagLevel::AA,
                ada_compliant: true,
                section508_compliant: true,
            })),
        }
    }

    /// Check an element for accessibility issues
    pub async fn check_element(&self, element: &ElementReference) -> Vec<AccessibilityIssue> {
        let rules = self.rules.lock().await;
        let mut issues = vec![];
        
        for rule in rules.iter() {
            if let Some(issue) = self.run_check(rule, element).await {
                issues.push(issue);
            }
        }
        
        // Store issues
        self.issues.lock().await.extend(issues.clone());
        
        issues
    }

    /// Generate compliance report
    pub async fn generate_report(&self) -> ComplianceReport {
        let issues = self.issues.lock().await.clone();
        let standards = self.standards.lock().await;
        
        let errors = issues.iter().filter(|i| i.severity == Severity::Error).count();
        let warnings = issues.iter().filter(|i| i.severity == Severity::Warning).count();
        let info = issues.iter().filter(|i| i.severity == Severity::Info).count();
        
        let wcag_a = issues.iter().filter(|i| i.wcag_level == WcagLevel::A).count();
        let wcag_aa = issues.iter().filter(|i| i.wcag_level == WcagLevel::AA).count();
        let wcag_aaa = issues.iter().filter(|i| i.wcag_level == WcagLevel::AAA).count();
        
        let mut by_category: HashMap<IssueCategory, usize> = HashMap::new();
        for issue in &issues {
            *by_category.entry(IssueCategory::Perceivable).or_insert(0) += 1;
        }
        
        // Calculate score (simplified)
        let total_weight = issues.len() as f64;
        let error_weight = errors as f64 * 3.0;
        let warning_weight = warnings as f64 * 1.0;
        let score = if total_weight > 0.0 {
            100.0 - ((error_weight + warning_weight) / total_weight * 100.0).min(100.0)
        } else {
            100.0
        };
        
        ComplianceReport {
            timestamp: current_timestamp(),
            total_issues: issues.len(),
            errors,
            warnings,
            info,
            wcag_a_issues: wcag_a,
            wcag_aa_issues: wcag_aa,
            wcag_aaa_issues: wcag_aaa,
            issues_by_category: by_category,
            issues,
            score,
        }
    }

    /// Clear issues
    pub async fn clear_issues(&self) {
        self.issues.lock().await.clear();
    }

    /// Add custom rule
    pub async fn add_rule(&self, rule: AccessibilityRule) {
        self.rules.lock().await.push(rule);
    }

    /// Get all rules
    pub async fn get_rules(&self) -> Vec<AccessibilityRule> {
        self.rules.lock().await.clone()
    }

    /// Set compliance standards
    pub async fn set_standards(&self, standards: ComplianceStandards) {
        *self.standards.lock().await = standards;
    }

    async fn run_check(&self, rule: &AccessibilityRule, element: &ElementReference) -> Option<AccessibilityIssue> {
        // Run the appropriate check based on rule id
        match rule.id.as_str() {
            "alt-text" => {
                if element.element_type == "image" && element.element_name.is_none() {
                    return Some(AccessibilityIssue {
                        rule_id: rule.id.clone(),
                        rule_name: rule.name.clone(),
                        description: rule.description.clone(),
                        element: Some(element.clone()),
                        severity: rule.severity,
                        wcag_level: rule.wcag_level,
                        wcag_criterion: "1.1.1".to_string(),
                        suggestion: "Add alt attribute describing the image".to_string(),
                        timestamp: current_timestamp(),
                    });
                }
            }
            "form-labels" => {
                if element.element_type == "input" && element.element_name.is_none() {
                    return Some(AccessibilityIssue {
                        rule_id: rule.id.clone(),
                        rule_name: rule.name.clone(),
                        description: rule.description.clone(),
                        element: Some(element.clone()),
                        severity: rule.severity,
                        wcag_level: rule.wcag_level,
                        wcag_criterion: "1.3.1".to_string(),
                        suggestion: "Associate a label with this input".to_string(),
                        timestamp: current_timestamp(),
                    });
                }
            }
            _ => {}
        }
        None
    }
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
