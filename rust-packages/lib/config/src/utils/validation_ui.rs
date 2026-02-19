//! Configuration validation UI helpers
//!
//! This module provides UI helpers for configuration validation.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;
use crate::utils::schema::{validate_schema, ErrorSeverity, ValidationError};

/// Represents a validation result with UI-friendly information.
#[derive(Debug, Clone)]
pub struct ValidationResult {
    is_valid: bool,
    errors: Vec<ValidationError>,
    warnings: Vec<ValidationError>,
    info: Vec<ValidationError>,
}

impl ValidationResult {
    /// Creates a new validation result.
    ///
    /// # Arguments
    ///
    /// * `errors` - List of validation errors
    ///
    /// # Returns
    ///
    /// Returns a new validation result.
    pub fn new(errors: Vec<ValidationError>) -> Self {
        let mut result = Self {
            is_valid: true,
            errors: Vec::new(),
            warnings: Vec::new(),
            info: Vec::new(),
        };

        for error in errors {
            match error.severity() {
                ErrorSeverity::Error => {
                    result.is_valid = false;
                    result.errors.push(error);
                }
                ErrorSeverity::Warning => {
                    result.warnings.push(error);
                }
                ErrorSeverity::Info => {
                    result.info.push(error);
                }
            }
        }

        result
    }

    /// Returns `true` if configuration is valid.
    ///
    /// # Returns
    ///
    /// Returns `true` if valid.
    pub fn is_valid(&self) -> bool {
        self.is_valid
    }

    /// Returns all errors.
    ///
    /// # Returns
    ///
    /// Returns a slice of errors.
    pub fn errors(&self) -> &[ValidationError] {
        &self.errors
    }

    /// Returns all warnings.
    ///
    /// # Returns
    ///
    /// Returns a slice of warnings.
    pub fn warnings(&self) -> &[ValidationError] {
        &self.warnings
    }

    /// Returns all info messages.
    ///
    /// # Returns
    ///
    /// Returns a slice of info messages.
    pub fn info(&self) -> &[ValidationError] {
        &self.info
    }

    /// Returns the total number of issues.
    ///
    /// # Returns
    ///
    /// Returns the issue count.
    pub fn total_issues(&self) -> usize {
        self.errors.len() + self.warnings.len() + self.info.len()
    }
}

/// Validates configuration and returns UI-friendly result.
///
/// # Arguments
///
/// * `config` - The configuration to validate
///
/// # Returns
///
/// Returns the validation result.
///
/// # Example
///
/// ```no_run
/// use config::utils::validation_ui::validate_with_ui;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let result = validate_with_ui(&config);
/// println!("Valid: {}", result.is_valid());
/// println!("Errors: {}", result.errors().len());
/// ```
pub fn validate_with_ui(config: &AppConfig) -> ValidationResult {
    let errors = validate_schema(config);
    ValidationResult::new(errors)
}

/// Formats validation errors for display.
///
/// # Arguments
///
/// * `result` - The validation result
///
/// # Returns
///
/// Returns formatted errors as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::validation_ui::format_validation_errors;
///
/// let result = validate_with_ui(&config);
/// let formatted = format_validation_errors(&result);
/// println!("{}", formatted);
/// ```
pub fn format_validation_errors(result: &ValidationResult) -> String {
    let mut output = String::new();

    if !result.errors().is_empty() {
        output.push_str("Errors:\n");
        for error in result.errors() {
            output.push_str(&format!("  - {}: {}\n", error.path(), error.message()));
        }
    }

    if !result.warnings().is_empty() {
        output.push_str("\nWarnings:\n");
        for warning in result.warnings() {
            output.push_str(&format!("  - {}: {}\n", warning.path(), warning.message()));
        }
    }

    if !result.info().is_empty() {
        output.push_str("\nInfo:\n");
        for info in result.info() {
            output.push_str(&format!("  - {}: {}\n", info.path(), info.message()));
        }
    }

    output
}

/// Represents a validation suggestion.
#[derive(Debug, Clone)]
pub struct ValidationSuggestion {
    path: String,
    suggestion: String,
    severity: ErrorSeverity,
}

impl ValidationSuggestion {
    /// Creates a new validation suggestion.
    ///
    /// # Arguments
    ///
    /// * `path` - The field path
    /// * `suggestion` - The suggestion
    /// * `severity` - The severity
    ///
    /// # Returns
    ///
    /// Returns a new suggestion.
    pub fn new(path: String, suggestion: String, severity: ErrorSeverity) -> Self {
        Self {
            path,
            suggestion,
            severity,
        }
    }

    /// Returns the path.
    ///
    /// # Returns
    ///
    /// Returns the path.
    pub fn path(&self) -> &str {
        &self.path
    }

    /// Returns the suggestion.
    ///
    /// # Returns
    ///
    /// Returns the suggestion.
    pub fn suggestion(&self) -> &str {
        &self.suggestion
    }

    /// Returns the severity.
    ///
    /// # Returns
    ///
    /// Returns the severity.
    pub fn severity(&self) -> &ErrorSeverity {
        &self.severity
    }
}

/// Generates suggestions for configuration issues.
///
/// # Arguments
///
/// * `result` - The validation result
///
/// # Returns
    /// Returns a list of suggestions.
///
/// # Example
///
/// ```no_run
/// use config::utils::validation_ui::generate_suggestions;
///
/// let result = validate_with_ui(&config);
/// let suggestions = generate_suggestions(&result);
/// for suggestion in suggestions {
///     println!("{}: {}", suggestion.path(), suggestion.suggestion());
/// }
/// ```
pub fn generate_suggestions(result: &ValidationResult) -> Vec<ValidationSuggestion> {
    let mut suggestions = Vec::new();

    for error in result.errors() {
        suggestions.push(ValidationSuggestion::new(
            error.path().to_string(),
            format!("Fix: {}", error.message()),
            ErrorSeverity::Error,
        ));
    }

    for warning in result.warnings() {
        suggestions.push(ValidationSuggestion::new(
            warning.path().to_string(),
            format!("Consider: {}", warning.message()),
            ErrorSeverity::Warning,
        ));
    }

    suggestions
}

/// Represents a validation summary.
#[derive(Debug, Clone)]
pub struct ValidationSummary {
    total_fields: usize,
    valid_fields: usize,
    invalid_fields: usize,
    warning_fields: usize,
}

impl ValidationSummary {
    /// Creates a new validation summary.
    ///
    /// # Arguments
    ///
    /// * `result` - The validation result
    ///
    /// # Returns
    ///
    /// Returns a new summary.
    pub fn new(result: &ValidationResult) -> Self {
        Self {
            total_fields: 20, // Approximate total fields
            valid_fields: 20 - result.errors().len() - result.warnings().len(),
            invalid_fields: result.errors().len(),
            warning_fields: result.warnings().len(),
        }
    }

    /// Returns the total number of fields.
    ///
    /// # Returns
    ///
    /// Returns the total count.
    pub fn total_fields(&self) -> usize {
        self.total_fields
    }

    /// Returns the number of valid fields.
    ///
    /// # Returns
    ///
    /// Returns the valid count.
    pub fn valid_fields(&self) -> usize {
        self.valid_fields
    }

    /// Returns the number of invalid fields.
    ///
    /// # Returns
    ///
    /// Returns the invalid count.
    pub fn invalid_fields(&self) -> usize {
        self.invalid_fields
    }

    /// Returns the number of warning fields.
    ///
    /// # Returns
    ///
    /// Returns the warning count.
    pub fn warning_fields(&self) -> usize {
        self.warning_fields
    }

    /// Returns the validation percentage.
    ///
    /// # Returns
    ///
    /// Returns the percentage.
    pub fn validation_percentage(&self) -> f64 {
        if self.total_fields == 0 {
            100.0
        } else {
            (self.valid_fields as f64 / self.total_fields as f64) * 100.0
        }
    }
}

/// Generates a validation summary.
///
/// # Arguments
///
/// * `result` - The validation result
///
/// # Returns
    /// Returns the validation summary.
///
/// # Example
///
/// ```no_run
/// use config::utils::validation_ui::generate_validation_summary;
///
/// let result = validate_with_ui(&config);
/// let summary = generate_validation_summary(&result);
/// println!("Valid: {}%", summary.validation_percentage());
/// ```
pub fn generate_validation_summary(result: &ValidationResult) -> ValidationSummary {
    ValidationSummary::new(result)
}

/// Formats validation summary for display.
///
/// # Arguments
///
/// * `summary` - The validation summary
///
/// # Returns
    /// Returns formatted summary as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::validation_ui::format_validation_summary;
///
/// let result = validate_with_ui(&config);
/// let summary = generate_validation_summary(&result);
/// let formatted = format_validation_summary(&summary);
/// println!("{}", formatted);
/// ```
pub fn format_validation_summary(summary: &ValidationSummary) -> String {
    format!(
        "Validation Summary:\n\
         Total Fields: {}\n\
         Valid: {} ({:.1}%)\n\
         Invalid: {}\n\
         Warnings: {}",
        summary.total_fields(),
        summary.valid_fields(),
        summary.validation_percentage(),
        summary.invalid_fields(),
        summary.warning_fields()
    )
}

/// Represents a quick validation result for UI.
#[derive(Debug, Clone)]
pub struct QuickValidationResult {
    status: ValidationStatus,
    message: String,
}

/// Represents validation status.
#[derive(Debug, Clone, PartialEq)]
pub enum ValidationStatus {
    Valid,
    Invalid,
    Warning,
}

impl QuickValidationResult {
    /// Creates a new quick validation result.
    ///
    /// # Arguments
    ///
    /// * `status` - The validation status
    /// * `message` - The status message
    ///
    /// # Returns
    ///
    /// Returns a new result.
    pub fn new(status: ValidationStatus, message: String) -> Self {
        Self { status, message }
    }

    /// Returns the status.
    ///
    /// # Returns
    ///
    /// Returns the status.
    pub fn status(&self) -> ValidationStatus {
        self.status
    }

    /// Returns the message.
    ///
    /// # Returns
    ///
    /// Returns the message.
    pub fn message(&self) -> &str {
        &self.message
    }
}

/// Performs quick validation for UI.
///
/// # Arguments
///
/// * `config` - The configuration to validate
///
/// # Returns
    /// Returns the quick validation result.
///
/// # Example
///
/// ```no_run
/// use config::utils::validation_ui::quick_validate;
///
/// let config = AppConfig::default();
/// let result = quick_validate(&config);
/// println!("Status: {:?}", result.status());
/// println!("Message: {}", result.message());
/// ```
pub fn quick_validate(config: &AppConfig) -> QuickValidationResult {
    let result = validate_with_ui(config);

    if result.is_valid() {
        QuickValidationResult::new(
            ValidationStatus::Valid,
            "Configuration is valid".to_string(),
        )
    } else if !result.errors().is_empty() {
        QuickValidationResult::new(
            ValidationStatus::Invalid,
            format!("{} error(s) found", result.errors().len()),
        )
    } else {
        QuickValidationResult::new(
            ValidationStatus::Warning,
            format!("{} warning(s) found", result.warnings().len()),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_with_ui() {
        let config = AppConfig::default();
        let result = validate_with_ui(&config);

        assert!(result.is_valid());
        assert_eq!(result.total_issues(), 0);
    }

    #[test]
    fn test_format_validation_errors() {
        let config = AppConfig::default();
        let result = validate_with_ui(&config);
        let formatted = format_validation_errors(&result);

        assert!(formatted.contains("Errors:") || formatted.is_empty());
    }

    #[test]
    fn test_generate_suggestions() {
        let config = AppConfig::default();
        let result = validate_with_ui(&config);
        let suggestions = generate_suggestions(&result);

        assert!(suggestions.is_empty());
    }

    #[test]
    fn test_generate_validation_summary() {
        let config = AppConfig::default();
        let result = validate_with_ui(&config);
        let summary = generate_validation_summary(&result);

        assert_eq!(summary.total_fields(), 20);
        assert_eq!(summary.valid_fields(), 20);
        assert_eq!(summary.validation_percentage(), 100.0);
    }

    #[test]
    fn test_quick_validate() {
        let config = AppConfig::default();
        let result = quick_validate(&config);

        assert_eq!(result.status(), ValidationStatus::Valid);
        assert_eq!(result.message(), "Configuration is valid");
    }

    #[test]
    fn test_validation_suggestion() {
        let suggestion = ValidationSuggestion::new(
            "path".to_string(),
            "suggestion".to_string(),
            ErrorSeverity::Error,
        );

        assert_eq!(suggestion.path(), "path");
        assert_eq!(suggestion.suggestion(), "suggestion");
    }
}
