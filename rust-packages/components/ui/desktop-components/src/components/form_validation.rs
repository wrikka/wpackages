/// Form validation rules
#[derive(Debug, Clone)]
pub struct FormValidation {
    pub min_length: Option<usize>,
    pub max_length: Option<usize>,
    pub min_value: Option<f64>,
    pub max_value: Option<f64>,
    pub pattern: Option<String>,
    pub custom_validator: Option<String>,
}

impl FormValidation {
    pub fn new() -> Self {
        Self {
            min_length: None,
            max_length: None,
            min_value: None,
            max_value: None,
            pattern: None,
            custom_validator: None,
        }
    }

    pub fn min_length(mut self, length: usize) -> Self {
        self.min_length = Some(length);
        self
    }

    pub fn max_length(mut self, length: usize) -> Self {
        self.max_length = Some(length);
        self
    }

    pub fn min_value(mut self, value: f64) -> Self {
        self.min_value = Some(value);
        self
    }

    pub fn max_value(mut self, value: f64) -> Self {
        self.max_value = Some(value);
        self
    }

    pub fn pattern(mut self, pattern: impl Into<String>) -> Self {
        self.pattern = Some(pattern.into());
        self
    }
}

impl Default for FormValidation {
    fn default() -> Self {
        Self::new()
    }
}

use crate::components::form_types::{FormField, FormError};
use crate::components::form_state::FormState;

/// Validate form fields
pub fn validate_form(fields: &[FormField], state: &mut FormState) {
    for field in fields {
        let value = state.get_value(&field.name).cloned().unwrap_or_default();

        // Required validation
        if field.required && value.is_empty() {
            state.add_error(FormError::new(&field.name, "This field is required"));
            continue;
        }

        // Skip other validations if empty and not required
        if value.is_empty() {
            continue;
        }

        // Length validation
        if let Some(validation) = &field.validation {
            if let Some(min_length) = validation.min_length {
                if value.len() < min_length {
                    state.add_error(FormError::new(&field.name, &format!("Minimum length is {}", min_length)));
                }
            }
            if let Some(max_length) = validation.max_length {
                if value.len() > max_length {
                    state.add_error(FormError::new(&field.name, &format!("Maximum length is {}", max_length)));
                }
            }

            // Number validation
            if field.field_type == crate::components::form_types::FormFieldType::Number {
                if let Ok(num) = value.parse::<f64>() {
                    if let Some(min_value) = validation.min_value {
                        if num < min_value {
                            state.add_error(FormError::new(&field.name, &format!("Minimum value is {}", min_value)));
                        }
                    }
                    if let Some(max_value) = validation.max_value {
                        if num > max_value {
                            state.add_error(FormError::new(&field.name, &format!("Maximum value is {}", max_value)));
                        }
                    }
                }
            }

            // Pattern validation
            if let Some(_pattern) = &validation.pattern {
                // Pattern matching would be implemented here
                // For now, just skip
            }
        }
    }
}
