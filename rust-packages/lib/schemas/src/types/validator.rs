use crate::error::{SchemaError, SchemaResult};
use regex::Regex;
use std::sync::OnceLock;

pub trait Validator: Send + Sync {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()>;
    fn clone_box(&self) -> Box<dyn Validator>;
}

impl Clone for Box<dyn Validator> {
    fn clone(&self) -> Self {
        self.clone_box()
    }
}

pub struct StringLengthValidator {
    min: Option<usize>,
    max: Option<usize>,
}

impl StringLengthValidator {
    pub fn new(min: Option<usize>, max: Option<usize>) -> Self {
        Self { min, max }
    }
}

impl Validator for StringLengthValidator {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        if let Some(s) = value.as_str() {
            let len = s.chars().count();
            if let Some(min) = self.min {
                if len < min {
                    return Err(SchemaError::InvalidValue {
                        field: path.to_string(),
                        reason: format!("string length {} is less than minimum {}", len, min),
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
                        reason: format!("string length {} exceeds maximum {}", len, max),
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

impl Clone for StringLengthValidator {
    fn clone(&self) -> Self {
        Self {
            min: self.min,
            max: self.max,
        }
    }
}

pub struct RangeValidator<T> {
    min: Option<T>,
    max: Option<T>,
}

impl<T> RangeValidator<T> {
    pub fn new(min: Option<T>, max: Option<T>) -> Self {
        Self { min, max }
    }
}

impl Validator for RangeValidator<i64> {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        if let Some(n) = value.as_i64() {
            if let Some(min) = self.min {
                if n < min {
                    return Err(SchemaError::InvalidValue {
                        field: path.to_string(),
                        reason: format!("value {} is less than minimum {}", n, min),
                        path: if path.is_empty() {
                            None
                        } else {
                            Some(path.to_string())
                        },
                    });
                }
            }
            if let Some(max) = self.max {
                if n > max {
                    return Err(SchemaError::InvalidValue {
                        field: path.to_string(),
                        reason: format!("value {} exceeds maximum {}", n, max),
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

impl Clone for RangeValidator<i64> {
    fn clone(&self) -> Self {
        Self {
            min: self.min,
            max: self.max,
        }
    }
}

pub struct RegexValidator {
    regex: Regex,
}

impl RegexValidator {
    pub fn new(pattern: &str) -> SchemaResult<Self> {
        let regex = Regex::new(pattern)?;
        Ok(Self { regex })
    }
}

impl Validator for RegexValidator {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        if let Some(s) = value.as_str() {
            if !self.regex.is_match(s) {
                return Err(SchemaError::InvalidValue {
                    field: path.to_string(),
                    reason: "value does not match pattern".to_string(),
                    path: if path.is_empty() {
                        None
                    } else {
                        Some(path.to_string())
                    },
                });
            }
        }
        Ok(())
    }

    fn clone_box(&self) -> Box<dyn Validator> {
        Box::new(self.clone())
    }
}

impl Clone for RegexValidator {
    fn clone(&self) -> Self {
        Self {
            regex: self.regex.clone(),
        }
    }
}

pub struct EmailValidator;

impl Default for EmailValidator {
    fn default() -> Self {
        Self::new()
    }
}

impl EmailValidator {
    pub fn new() -> Self {
        Self
    }
}

impl Validator for EmailValidator {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        if let Some(s) = value.as_str() {
            if !email_address::EmailAddress::is_valid(s) {
                return Err(SchemaError::InvalidValue {
                    field: path.to_string(),
                    reason: "invalid email address".to_string(),
                    path: if path.is_empty() {
                        None
                    } else {
                        Some(path.to_string())
                    },
                });
            }
        }
        Ok(())
    }

    fn clone_box(&self) -> Box<dyn Validator> {
        Box::new(Self)
    }
}

impl Clone for EmailValidator {
    fn clone(&self) -> Self {
        Self
    }
}

pub struct UrlValidator;

static URL_REGEX: OnceLock<Regex> = OnceLock::new();

impl Default for UrlValidator {
    fn default() -> Self {
        Self::new()
    }
}

impl UrlValidator {
    pub fn new() -> Self {
        Self
    }

    fn get_regex() -> &'static Regex {
        URL_REGEX.get_or_init(|| Regex::new(r"^https?://[^\s/$.?#].[^\s]*$").unwrap())
    }
}

impl Validator for UrlValidator {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        if let Some(s) = value.as_str() {
            if !Self::get_regex().is_match(s) {
                return Err(SchemaError::InvalidValue {
                    field: path.to_string(),
                    reason: "invalid URL".to_string(),
                    path: if path.is_empty() {
                        None
                    } else {
                        Some(path.to_string())
                    },
                });
            }
        }
        Ok(())
    }

    fn clone_box(&self) -> Box<dyn Validator> {
        Box::new(Self)
    }
}

impl Clone for UrlValidator {
    fn clone(&self) -> Self {
        Self
    }
}

pub struct EnumValidator {
    values: Vec<String>,
}

impl EnumValidator {
    pub fn new(values: Vec<String>) -> Self {
        Self { values }
    }
}

impl Validator for EnumValidator {
    fn validate(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        if let Some(s) = value.as_str() {
            if !self.values.contains(&s.to_string()) {
                return Err(SchemaError::InvalidValue {
                    field: path.to_string(),
                    reason: format!("value must be one of: {:?}", self.values),
                    path: if path.is_empty() {
                        None
                    } else {
                        Some(path.to_string())
                    },
                });
            }
        }
        Ok(())
    }

    fn clone_box(&self) -> Box<dyn Validator> {
        Box::new(self.clone())
    }
}

impl Clone for EnumValidator {
    fn clone(&self) -> Self {
        Self {
            values: self.values.clone(),
        }
    }
}
