use crate::error::{SchemaError, SchemaResult};
use crate::types::validator::{
    EmailValidator, EnumValidator, RangeValidator, RegexValidator, StringLengthValidator,
    UrlValidator, Validator,
};
use crate::types::{Schema, SchemaType};

// Validators module for derive macro
pub mod validators {
    use super::*;

    pub fn min_length(min: usize) -> Box<dyn Validator> {
        Box::new(StringLengthValidator::new(Some(min), None))
    }

    pub fn max_length(max: usize) -> Box<dyn Validator> {
        Box::new(StringLengthValidator::new(None, Some(max)))
    }

    pub fn min(min: i64) -> Box<dyn Validator> {
        Box::new(RangeValidator::new(Some(min), None))
    }

    pub fn max(max: i64) -> Box<dyn Validator> {
        Box::new(RangeValidator::new(None, Some(max)))
    }

    pub fn email() -> Box<dyn Validator> {
        Box::new(EmailValidator::new())
    }

    pub fn url() -> Box<dyn Validator> {
        Box::new(UrlValidator::new())
    }

    pub fn enum_validator(values: Vec<String>) -> Box<dyn Validator> {
        Box::new(EnumValidator::new(values))
    }
}

pub trait SchemaBuilder {
    fn string() -> Schema;
    fn integer() -> Schema;
    fn float() -> Schema;
    fn boolean() -> Schema;
    fn array() -> Schema;
    fn object() -> Schema;
}

pub struct SchemaBuilderImpl;

impl SchemaBuilder for SchemaBuilderImpl {
    fn string() -> Schema {
        Schema::new(SchemaType::String)
    }

    fn integer() -> Schema {
        Schema::new(SchemaType::Integer)
    }

    fn float() -> Schema {
        Schema::new(SchemaType::Float)
    }

    fn boolean() -> Schema {
        Schema::new(SchemaType::Boolean)
    }

    fn array() -> Schema {
        Schema::new(SchemaType::Array)
    }

    fn object() -> Schema {
        Schema::new(SchemaType::Object)
    }
}

pub trait StringSchema: Sized {
    fn min_length(self, min: usize) -> Self;
    fn max_length(self, max: usize) -> Self;
    fn length_range(self, min: usize, max: usize) -> Self;
    fn email(self) -> Self;
    fn url(self) -> Self;
    fn pattern(self, pattern: &str) -> SchemaResult<Self>;
}

impl StringSchema for Schema {
    fn min_length(mut self, min: usize) -> Self {
        self.validators
            .push(Box::new(StringLengthValidator::new(Some(min), None)));
        self
    }

    fn max_length(mut self, max: usize) -> Self {
        self.validators
            .push(Box::new(StringLengthValidator::new(None, Some(max))));
        self
    }

    fn length_range(mut self, min: usize, max: usize) -> Self {
        self.validators
            .push(Box::new(StringLengthValidator::new(Some(min), Some(max))));
        self
    }

    fn email(mut self) -> Self {
        self.validators.push(Box::new(EmailValidator::new()));
        self
    }

    fn url(mut self) -> Self {
        self.validators.push(Box::new(UrlValidator::new()));
        self
    }

    fn pattern(mut self, pattern: &str) -> SchemaResult<Self> {
        let validator = RegexValidator::new(pattern)?;
        self.validators.push(Box::new(validator));
        Ok(self)
    }
}

pub trait NumberSchema: Sized {
    fn min(self, min: i64) -> Self;
    fn max(self, max: i64) -> Self;
    fn range(self, min: i64, max: i64) -> Self;
}

impl NumberSchema for Schema {
    fn min(mut self, min: i64) -> Self {
        self.validators
            .push(Box::new(RangeValidator::new(Some(min), None)));
        self
    }

    fn max(mut self, max: i64) -> Self {
        self.validators
            .push(Box::new(RangeValidator::new(None, Some(max))));
        self
    }

    fn range(mut self, min: i64, max: i64) -> Self {
        self.validators
            .push(Box::new(RangeValidator::new(Some(min), Some(max))));
        self
    }
}

pub trait ArraySchema: Sized {
    fn items(self, schema: Schema) -> Self;
    fn min_items(self, min: usize) -> Self;
    fn max_items(self, max: usize) -> Self;
}

impl ArraySchema for Schema {
    fn items(mut self, schema: Schema) -> Self {
        self.items = Some(Box::new(schema));
        self
    }

    fn min_items(mut self, min: usize) -> Self {
        self.validators
            .push(Box::new(ArrayLengthValidator::new(Some(min), None)));
        self
    }

    fn max_items(mut self, max: usize) -> Self {
        self.validators
            .push(Box::new(ArrayLengthValidator::new(None, Some(max))));
        self
    }
}

struct ArrayLengthValidator {
    min: Option<usize>,
    max: Option<usize>,
}

impl ArrayLengthValidator {
    fn new(min: Option<usize>, max: Option<usize>) -> Self {
        Self { min, max }
    }
}

impl Validator for ArrayLengthValidator {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        if let Some(arr) = value.as_array() {
            let len = arr.len();
            if let Some(min) = self.min {
                if len < min {
                    return Err(SchemaError::InvalidValue {
                        field: path.to_string(),
                        reason: format!("array length {} is less than minimum {}", len, min),
                        path: if path.is_empty() {
                            None
                        } else {
                            Some(path.to_string())
                        },
                    });
                }
            }
            if let Some(max) = self.max {
                if len > max {
                    return Err(SchemaError::InvalidValue {
                        field: path.to_string(),
                        reason: format!("array length {} exceeds maximum {}", len, max),
                        path: if path.is_empty() {
                            None
                        } else {
                            Some(path.to_string())
                        },
                    });
                }
            }
        }
        Ok(())
    }

    fn clone_box(&self) -> Box<dyn Validator> {
        Box::new(self.clone())
    }
}

impl Clone for ArrayLengthValidator {
    fn clone(&self) -> Self {
        Self {
            min: self.min,
            max: self.max,
        }
    }
}
