use crate::error::EffectError;
use crate::types::effect::Effect;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Validation result
#[derive(Debug, Clone)]
pub enum ValidationResult {
    Valid,
    Invalid(Vec<String>),
}

impl ValidationResult {
    pub fn is_valid(&self) -> bool {
        matches!(self, ValidationResult::Valid)
    }

    pub fn errors(&self) -> Vec<String> {
        match self {
            ValidationResult::Valid => vec![],
            ValidationResult::Invalid(errors) => errors.clone(),
        }
    }
}

/// Schema validator trait
pub trait SchemaValidator<T>: Send + Sync {
    fn validate(&self, value: &T) -> ValidationResult;
}

/// JSON Schema validator (simplified)
#[derive(Debug, Clone)]
pub struct JsonSchemaValidator {
    required_fields: Vec<String>,
    field_types: std::collections::HashMap<String, String>,
}

impl JsonSchemaValidator {
    pub fn new() -> Self {
        Self {
            required_fields: Vec::new(),
            field_types: std::collections::HashMap::new(),
        }
    }

    pub fn require_field(mut self, field: impl Into<String>) -> Self {
        self.required_fields.push(field.into());
        self
    }
}

impl<T: Serialize> SchemaValidator<T> for JsonSchemaValidator {
    fn validate(&self, value: &T) -> ValidationResult {
        let json = match serde_json::to_value(value) {
            Ok(v) => v,
            Err(e) => return ValidationResult::Invalid(vec![format!("Serialization error: {}", e)]),
        };

        let mut errors = Vec::new();

        // Check required fields
        if let Some(obj) = json.as_object() {
            for field in &self.required_fields {
                if !obj.contains_key(field) {
                    errors.push(format!("Missing required field: {}", field));
                }
            }
        }

        if errors.is_empty() {
            ValidationResult::Valid
        } else {
            ValidationResult::Invalid(errors)
        }
    }
}

/// Input validation extension
pub trait ValidationExt<T, E, R> {
    /// Validate input before executing effect
    fn validate_input<V>(self, validator: Arc<V>) -> Effect<T, E, R>
    where
        V: SchemaValidator<R> + 'static;

    /// Validate output after executing effect
    fn validate_output<V>(self, validator: Arc<V>) -> Effect<T, E, R>
    where
        V: SchemaValidator<T> + 'static;
}

impl<T, E, R> ValidationExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + Serialize + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + Serialize + 'static,
{
    fn validate_input<V>(self, validator: Arc<V>) -> Effect<T, E, R>
    where
        V: SchemaValidator<R> + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let validator = validator.clone();

            Box::pin(async move {
                let result = validator.validate(&ctx);
                if !result.is_valid() {
                    return Err(EffectError::EffectFailed(format!(
                        "Input validation failed: {:?}",
                        result.errors()
                    ))
                    .into());
                }

                effect.run(ctx).await
            })
        })
    }

    fn validate_output<V>(self, validator: Arc<V>) -> Effect<T, E, R>
    where
        V: SchemaValidator<T> + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let validator = validator.clone();

            Box::pin(async move {
                let result = effect.run(ctx).await?;

                let validation = validator.validate(&result);
                if !validation.is_valid() {
                    return Err(EffectError::EffectFailed(format!(
                        "Output validation failed: {:?}",
                        validation.errors()
                    ))
                    .into());
                }

                Ok(result)
            })
        })
    }
}

/// Constraint validation for primitive types
#[derive(Debug, Clone)]
pub struct Constraints {
    pub min_length: Option<usize>,
    pub max_length: Option<usize>,
    pub min_value: Option<f64>,
    pub max_value: Option<f64>,
    pub pattern: Option<String>,
    pub required: bool,
}

impl Default for Constraints {
    fn default() -> Self {
        Self {
            min_length: None,
            max_length: None,
            min_value: None,
            max_value: None,
            pattern: None,
            required: true,
        }
    }
}

impl Constraints {
    pub fn min_length(mut self, value: usize) -> Self {
        self.min_length = Some(value);
        self
    }

    pub fn max_length(mut self, value: usize) -> Self {
        self.max_length = Some(value);
        self
    }

    pub fn pattern(mut self, regex: impl Into<String>) -> Self {
        self.pattern = Some(regex.into());
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::Serialize;

    #[derive(Serialize)]
    struct TestInput {
        name: String,
    }

    #[tokio::test]
    async fn test_input_validation() {
        let validator = Arc::new(JsonSchemaValidator::new().require_field("name"));

        let effect = Effect::<i32, EffectError, TestInput>::new(|ctx| {
            Box::pin(async move { Ok(ctx.name.len() as i32) })
        })
        .validate_input(validator);

        // Valid input
        let result = effect.clone().run(TestInput { name: "test".to_string() }).await;
        assert_eq!(result.unwrap(), 4);
    }
}
