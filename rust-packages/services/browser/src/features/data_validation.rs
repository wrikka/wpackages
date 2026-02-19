use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationSchema {
    pub field_name: String,
    pub rules: Vec<ValidationRule>,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "params")]
pub enum ValidationRule {
    Type { expected: DataType },
    MinLength { value: usize },
    MaxLength { value: usize },
    MinValue { value: f64 },
    MaxValue { value: f64 },
    Pattern { regex: String },
    Enum { values: Vec<String> },
    Email,
    Url,
    Uuid,
    Date { format: String },
    Custom { validator_name: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataType {
    String,
    Number,
    Integer,
    Boolean,
    Array,
    Object,
    Null,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub field_name: String,
    pub errors: Vec<ValidationError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub rule: String,
    pub message: String,
    pub value: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataValidator {
    schemas: HashMap<String, ValidationSchema>,
    custom_validators: HashMap<String, Box<dyn Fn(&Value) -> bool + Send + Sync>>,
}

impl DataValidator {
    pub fn new() -> Self {
        Self {
            schemas: HashMap::new(),
            custom_validators: HashMap::new(),
        }
    }

    pub fn add_schema(&mut self, schema: ValidationSchema) {
        self.schemas.insert(schema.field_name.clone(), schema);
    }

    pub fn validate(&self, data: &HashMap<String, Value>) -> Vec<ValidationResult> {
        let mut results = Vec::new();

        for (field_name, schema) in &self.schemas {
            let value = data.get(field_name);
            let result = self.validate_field(field_name, value, schema);
            results.push(result);
        }

        results
    }

    pub fn validate_field(
        &self,
        field_name: &str,
        value: Option<&Value>,
        schema: &ValidationSchema,
    ) -> ValidationResult {
        let mut errors = Vec::new();

        // Check required
        if schema.required && value.is_none() {
            errors.push(ValidationError {
                rule: "required".to_string(),
                message: format!("Field '{}' is required", field_name),
                value: None,
            });
            return ValidationResult {
                valid: false,
                field_name: field_name.to_string(),
                errors,
            };
        }

        // Skip validation if value is None and not required
        if value.is_none() && !schema.required {
            return ValidationResult {
                valid: true,
                field_name: field_name.to_string(),
                errors,
            };
        }

        let value = value.unwrap();

        // Apply rules
        for rule in &schema.rules {
            match rule {
                ValidationRule::Type { expected } => {
                    if !self.check_type(value, expected) {
                        errors.push(ValidationError {
                            rule: "type".to_string(),
                            message: format!(
                                "Expected type {:?}, got {:?}",
                                expected,
                                self.get_actual_type(value)
                            ),
                            value: Some(value.clone()),
                        });
                    }
                }
                ValidationRule::MinLength { value: min } => {
                    let len = self.get_length(value);
                    if len < *min {
                        errors.push(ValidationError {
                            rule: "minLength".to_string(),
                            message: format!("Minimum length is {}, got {}", min, len),
                            value: Some(value.clone()),
                        });
                    }
                }
                ValidationRule::MaxLength { value: max } => {
                    let len = self.get_length(value);
                    if len > *max {
                        errors.push(ValidationError {
                            rule: "maxLength".to_string(),
                            message: format!("Maximum length is {}, got {}", max, len),
                            value: Some(value.clone()),
                        });
                    }
                }
                ValidationRule::MinValue { value: min } => {
                    if let Some(num) = value.as_f64() {
                        if num < *min {
                            errors.push(ValidationError {
                                rule: "minValue".to_string(),
                                message: format!("Minimum value is {}, got {}", min, num),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::MaxValue { value: max } => {
                    if let Some(num) = value.as_f64() {
                        if num > *max {
                            errors.push(ValidationError {
                                rule: "maxValue".to_string(),
                                message: format!("Maximum value is {}, got {}", max, num),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::Pattern { regex: pattern } => {
                    if let Some(s) = value.as_str() {
                        // Simple pattern matching (in production, use regex crate)
                        let matched = s.contains(&pattern.replace(".*", "").replace("^", "").replace("$", ""));
                        if !matched {
                            errors.push(ValidationError {
                                rule: "pattern".to_string(),
                                message: format!("Value does not match pattern: {}", pattern),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::Enum { values } => {
                    if let Some(s) = value.as_str() {
                        if !values.contains(&s.to_string()) {
                            errors.push(ValidationError {
                                rule: "enum".to_string(),
                                message: format!("Value must be one of: {:?}", values),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::Email => {
                    if let Some(s) = value.as_str() {
                        let email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
                        if !s.contains('@') || !s.contains('.') {
                            errors.push(ValidationError {
                                rule: "email".to_string(),
                                message: "Invalid email format".to_string(),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::Url => {
                    if let Some(s) = value.as_str() {
                        if !s.starts_with("http://") && !s.starts_with("https://") {
                            errors.push(ValidationError {
                                rule: "url".to_string(),
                                message: "Invalid URL format".to_string(),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::Uuid => {
                    if let Some(s) = value.as_str() {
                        // Simple UUID check (8-4-4-4-12 format)
                        let parts: Vec<&str> = s.split('-').collect();
                        if parts.len() != 5 ||
                           parts[0].len() != 8 ||
                           parts[1].len() != 4 ||
                           parts[2].len() != 4 ||
                           parts[3].len() != 4 ||
                           parts[4].len() != 12 {
                            errors.push(ValidationError {
                                rule: "uuid".to_string(),
                                message: "Invalid UUID format".to_string(),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::Date { format: _ } => {
                    if let Some(s) = value.as_str() {
                        // Simple date validation
                        if !s.contains('-') && !s.contains('/') {
                            errors.push(ValidationError {
                                rule: "date".to_string(),
                                message: "Invalid date format".to_string(),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
                ValidationRule::Custom { validator_name } => {
                    if let Some(validator) = self.custom_validators.get(validator_name) {
                        if !validator(value) {
                            errors.push(ValidationError {
                                rule: format!("custom:{}", validator_name),
                                message: format!("Custom validation '{}' failed", validator_name),
                                value: Some(value.clone()),
                            });
                        }
                    }
                }
            }
        }

        ValidationResult {
            valid: errors.is_empty(),
            field_name: field_name.to_string(),
            errors,
        }
    }

    fn check_type(&self, value: &Value, expected: &DataType) -> bool {
        match expected {
            DataType::String => value.is_string(),
            DataType::Number => value.is_number(),
            DataType::Integer => value.is_i64() || value.is_u64(),
            DataType::Boolean => value.is_boolean(),
            DataType::Array => value.is_array(),
            DataType::Object => value.is_object(),
            DataType::Null => value.is_null(),
        }
    }

    fn get_actual_type(&self, value: &Value) -> DataType {
        match value {
            Value::String(_) => DataType::String,
            Value::Number(n) => {
                if n.is_i64() || n.is_u64() {
                    DataType::Integer
                } else {
                    DataType::Number
                }
            }
            Value::Bool(_) => DataType::Boolean,
            Value::Array(_) => DataType::Array,
            Value::Object(_) => DataType::Object,
            Value::Null => DataType::Null,
        }
    }

    fn get_length(&self, value: &Value) -> usize {
        match value {
            Value::String(s) => s.len(),
            Value::Array(a) => a.len(),
            Value::Object(o) => o.len(),
            _ => 0,
        }
    }

    pub fn validate_json(&self, json_str: &str) -> Vec<ValidationResult> {
        match serde_json::from_str::<HashMap<String, Value>>(json_str) {
            Ok(data) => self.validate(&data),
            Err(e) => vec![ValidationResult {
                valid: false,
                field_name: "_root".to_string(),
                errors: vec![ValidationError {
                    rule: "json_parse".to_string(),
                    message: format!("Failed to parse JSON: {}", e),
                    value: None,
                }],
            }],
        }
    }

    pub fn create_schema_from_sample(&self, sample: &Value, field_name: &str) -> ValidationSchema {
        let mut rules = Vec::new();
        let required = !sample.is_null();

        // Add type rule
        rules.push(ValidationRule::Type {
            expected: self.get_actual_type(sample),
        });

        // Add length rules for strings
        if let Some(s) = sample.as_str() {
            rules.push(ValidationRule::MaxLength { value: s.len() * 2 });
        }

        ValidationSchema {
            field_name: field_name.to_string(),
            rules,
            required,
        }
    }
}

impl Default for DataValidator {
    fn default() -> Self {
        Self::new()
    }
}
