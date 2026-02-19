use std::collections::HashMap;
use crate::components::form_types::FormError;

/// Form state
#[derive(Debug, Clone)]
pub struct FormState {
    pub values: HashMap<String, String>,
    pub errors: Vec<FormError>,
    pub touched: HashMap<String, bool>,
}

impl Default for FormState {
    fn default() -> Self {
        Self {
            values: HashMap::new(),
            errors: Vec::new(),
            touched: HashMap::new(),
        }
    }
}

impl FormState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_value(&mut self, field_name: &str, value: String) {
        self.values.insert(field_name.to_string(), value);
        self.touched.insert(field_name.to_string(), true);
    }

    pub fn get_value(&self, field_name: &str) -> Option<&String> {
        self.values.get(field_name)
    }

    pub fn add_error(&mut self, error: FormError) {
        self.errors.push(error);
    }

    pub fn clear_errors(&mut self) {
        self.errors.clear();
    }

    pub fn is_valid(&self) -> bool {
        self.errors.is_empty()
    }

    pub fn is_touched(&self, field_name: &str) -> bool {
        self.touched.get(field_name).copied().unwrap_or(false)
    }

    pub fn has_error(&self, field_name: &str) -> bool {
        self.errors.iter().any(|e| e.field_name == field_name)
    }

    pub fn get_field_errors(&self, field_name: &str) -> Vec<&FormError> {
        self.errors.iter().filter(|e| e.field_name == field_name).collect()
    }
}

/// Form data extractor
///
/// Extract typed values from form state
///
/// # Arguments
/// * `state` - The form state
///
/// # Returns
/// * HashMap of field names to values
///
/// # Examples
/// ```no_run
/// use rsui::components::form_builder::{FormState, extract_form_data};
///
/// let state = FormState::new();
/// let data = extract_form_data(&state);
/// ```
pub fn extract_form_data(state: &FormState) -> HashMap<String, String> {
    state.values.clone()
}
