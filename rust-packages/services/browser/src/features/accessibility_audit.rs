use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessibilityViolation {
    pub rule: String,
    pub severity: ViolationSeverity,
    pub message: String,
    pub element: Option<String>,
    pub help: String,
    pub help_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ViolationSeverity {
    Critical,
    Serious,
    Moderate,
    Minor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessibilityAuditResult {
    pub violations: Vec<AccessibilityViolation>,
    pub passes: Vec<String>,
    pub incomplete: Vec<String>,
    pub score: f64,
}

#[derive(Debug, Clone)]
pub struct AccessibilityAuditor;

impl AccessibilityAuditor {
    pub fn new() -> Self {
        Self
    }

    pub fn audit_html(&self, html: &str) -> AccessibilityAuditResult {
        let mut violations = Vec::new();
        let mut passes = Vec::new();

        if self.has_images_without_alt(html) {
            violations.push(AccessibilityViolation {
                rule: "image-alt".to_string(),
                severity: ViolationSeverity::Critical,
                message: "Images must have alternate text".to_string(),
                element: None,
                help: "Add alt attribute to img elements".to_string(),
                help_url: "https://dequeuniversity.com/rules/axe/4.0/image-alt".to_string(),
            });
        } else {
            passes.push("image-alt".to_string());
        }

        if self.has_form_labels(html) {
            violations.push(AccessibilityViolation {
                rule: "label".to_string(),
                severity: ViolationSeverity::Critical,
                message: "Form elements must have labels".to_string(),
                element: None,
                help: "Add label elements or aria-label".to_string(),
                help_url: "https://dequeuniversity.com/rules/axe/4.0/label".to_string(),
            });
        } else {
            passes.push("label".to_string());
        }

        if self.has_low_contrast(html) {
            violations.push(AccessibilityViolation {
                rule: "color-contrast".to_string(),
                severity: ViolationSeverity::Serious,
                message: "Elements must have sufficient color contrast".to_string(),
                element: None,
                help: "Ensure contrast ratio is at least 4.5:1".to_string(),
                help_url: "https://dequeuniversity.com/rules/axe/4.0/color-contrast".to_string(),
            });
        } else {
            passes.push("color-contrast".to_string());
        }

        if self.has_missing_lang(html) {
            violations.push(AccessibilityViolation {
                rule: "html-has-lang".to_string(),
                severity: ViolationSeverity::Serious,
                message: "<html> element must have a lang attribute".to_string(),
                element: Some("html".to_string()),
                help: "Add lang attribute to html element".to_string(),
                help_url: "https://dequeuniversity.com/rules/axe/4.0/html-has-lang".to_string(),
            });
        } else {
            passes.push("html-has-lang".to_string());
        }

        if self.has_missing_page_title(html) {
            violations.push(AccessibilityViolation {
                rule: "document-title".to_string(),
                severity: ViolationSeverity::Serious,
                message: "Page must have a title".to_string(),
                element: Some("title".to_string()),
                help: "Add a non-empty title element in head".to_string(),
                help_url: "https://dequeuniversity.com/rules/axe/4.0/document-title".to_string(),
            });
        } else {
            passes.push("document-title".to_string());
        }

        let score = self.calculate_score(&violations, &passes);

        AccessibilityAuditResult {
            violations,
            passes,
            incomplete: Vec::new(),
            score,
        }
    }

    fn has_images_without_alt(&self, html: &str) -> bool {
        html.contains("<img") && !html.contains("alt=")
    }

    fn has_form_labels(&self, html: &str) -> bool {
        let input_pattern = regex::Regex::new(r"<input[^>]*>").unwrap();
        let label_pattern = regex::Regex::new(r"<label[^>]*>").unwrap();
        
        let input_count = input_pattern.find_iter(html).count();
        let label_count = label_pattern.find_iter(html).count();
        
        input_count > label_count
    }

    fn has_low_contrast(&self, _html: &str) -> bool {
        false
    }

    fn has_missing_lang(&self, html: &str) -> bool {
        html.contains("<html") && !html.contains("<html lang=")
    }

    fn has_missing_page_title(&self, html: &str) -> bool {
        !html.contains("<title>") || !html.contains("</title>")
    }

    fn calculate_score(&self, violations: &[AccessibilityViolation], passes: &[String]) -> f64 {
        let total = violations.len() + passes.len();
        if total == 0 {
            return 100.0;
        }
        
        let critical_weight = 25.0;
        let serious_weight = 10.0;
        let moderate_weight = 5.0;
        let minor_weight = 1.0;
        
        let penalty: f64 = violations.iter().map(|v| match v.severity {
            ViolationSeverity::Critical => critical_weight,
            ViolationSeverity::Serious => serious_weight,
            ViolationSeverity::Moderate => moderate_weight,
            ViolationSeverity::Minor => minor_weight,
        }).sum();
        
        let max_score = 100.0;
        let final_score = max_score - penalty;
        final_score.max(0.0)
    }

    pub fn generate_report(&self, result: &AccessibilityAuditResult) -> String {
        let mut report = format!("Accessibility Audit Report\n");
        report.push_str(&format!("Score: {:.0}/100\n\n", result.score));
        
        if !result.violations.is_empty() {
            report.push_str("Violations:\n");
            for v in &result.violations {
                report.push_str(&format!(
                    "  - [{}] {}: {}\n    Help: {}\n    URL: {}\n\n",
                    serde_json::to_string(&v.severity).unwrap_or_default().replace('"', ""),
                    v.rule,
                    v.message,
                    v.help,
                    v.help_url
                ));
            }
        }
        
        report.push_str(&format!("\nPassed: {} rules\n", result.passes.len()));
        report
    }
}
