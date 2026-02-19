use crate::error::{Error, Result};
use async_trait::async_trait;
use std::fmt;

/// Validation error with message
#[derive(Debug, Clone)]
pub struct ValidationError {
    pub message: String,
    pub code: Option<String>,
}

impl ValidationError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            code: None,
        }
    }

    pub fn with_code(mut self, code: impl Into<String>) -> Self {
        self.code = Some(code.into());
        self
    }
}

impl fmt::Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for ValidationError {}

/// Validator trait for sync validation
pub trait Validator<T>: Send + Sync {
    fn validate(&self, value: &T) -> std::result::Result<(), ValidationError>;
}

/// Async validator trait
#[async_trait]
pub trait AsyncValidator<T>: Send + Sync {
    async fn validate(&self, value: &T) -> std::result::Result<(), ValidationError>;
}

/// Validator implementation for closures
impl<T, F> Validator<T> for F
where
    F: Fn(&T) -> bool + Send + Sync,
{
    fn validate(&self, value: &T) -> std::result::Result<(), ValidationError> {
        if self(value) {
            Ok(())
        } else {
            Err(ValidationError::new("Validation failed"))
        }
    }
}

/// Common validators
pub struct Validators;

impl Validators {
    /// Non-empty validator for strings
    pub fn non_empty() -> impl Validator<String> {
        |s: &String| !s.trim().is_empty()
    }

    /// Minimum length validator
    pub fn min_length(min: usize) -> impl Validator<String> {
        move |s: &String| s.len() >= min
    }

    /// Maximum length validator
    pub fn max_length(max: usize) -> impl Validator<String> {
        move |s: &String| s.len() <= max
    }

    /// Length range validator
    pub fn length_range(min: usize, max: usize) -> impl Validator<String> {
        move |s: &String| s.len() >= min && s.len() <= max
    }

    /// Email validator
    pub fn email() -> impl Validator<String> {
        |s: &String| {
            let re = regex_lite::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
            re.is_match(s)
        }
    }

    /// URL validator
    pub fn url() -> impl Validator<String> {
        |s: &String| {
            s.starts_with("http://") || s.starts_with("https://")
        }
    }

    /// Numeric range validator
    pub fn range<T>(min: T, max: T) -> impl Validator<T>
    where
        T: PartialOrd + Send + Sync,
    {
        move |v: &T| *v >= min && *v <= max
    }

    /// Pattern/regex validator
    pub fn regex(pattern: &str) -> impl Validator<String> + '_ {
        let re = regex_lite::Regex::new(pattern).unwrap();
        move |s: &String| re.is_match(s)
    }
}

/// Validation chain builder
pub struct ValidationChain<T> {
    validators: Vec<Box<dyn Validator<T>>>,
}

impl<T> ValidationChain<T> {
    pub fn new() -> Self {
        Self {
            validators: Vec::new(),
        }
    }

    pub fn add<V>(mut self, validator: V) -> Self
    where
        V: Validator<T> + 'static,
    {
        self.validators.push(Box::new(validator));
        self
    }

    pub fn validate(&self, value: &T) -> std::result::Result<(), ValidationError> {
        for validator in &self.validators {
            validator.validate(value)?;
        }
        Ok(())
    }
}

impl<T> Default for ValidationChain<T> {
    fn default() -> Self {
        Self::new()
    }
}
