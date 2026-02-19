use crate::error::{SchemaError, SchemaResult};
use crate::types::validator::Validator;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SchemaType {
    String,
    Integer,
    Float,
    Boolean,
    Array,
    Object,
    Null,
}

#[derive(Clone)]
pub struct Schema {
    pub name: Option<String>,
    pub schema_type: SchemaType,
    pub validators: Vec<Box<dyn Validator>>,
    pub properties: Option<HashMap<String, Schema>>,
    pub items: Option<Box<Schema>>,
    pub required: Vec<String>,
    pub additional_properties: Option<Box<Schema>>,
}

impl Schema {
    pub fn new(schema_type: SchemaType) -> Self {
        Self {
            name: None,
            schema_type,
            validators: Vec::new(),
            properties: None,
            items: None,
            required: Vec::new(),
            additional_properties: None,
        }
    }

    pub fn with_name(mut self, name: impl Into<String>) -> Self {
        self.name = Some(name.into());
        self
    }

    pub fn with_validator(mut self, validator: Box<dyn Validator>) -> Self {
        self.validators.push(validator);
        self
    }

    pub fn with_property(mut self, name: impl Into<String>, schema: Schema) -> Self {
        let properties = self.properties.get_or_insert_with(HashMap::new);
        properties.insert(name.into(), schema);
        self
    }

    pub fn with_required(mut self, field: impl Into<String>) -> Self {
        self.required.push(field.into());
        self
    }

    pub fn with_items(mut self, schema: Schema) -> Self {
        self.items = Some(Box::new(schema));
        self
    }

    pub fn with_additional_properties(mut self, schema: Schema) -> Self {
        self.additional_properties = Some(Box::new(schema));
        self
    }

    pub fn field(self, name: impl Into<String>, schema: Schema) -> Self {
        self.with_property(name, schema)
    }

    pub fn required(self, field: impl Into<String>) -> Self {
        self.with_required(field)
    }

    pub fn build(self) -> Self {
        self
    }

    pub fn validate(&self, value: &serde_json::Value) -> SchemaResult<()> {
        self.validate_with_path(value, "")
    }

    fn validate_with_path(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        self.validate_type(value, path)?;

        for validator in &self.validators {
            validator.validate(value, path)?;
        }

        match self.schema_type {
            SchemaType::Object => self.validate_object(value, path)?,
            SchemaType::Array => self.validate_array(value, path)?,
            _ => {}
        }

        Ok(())
    }

    fn validate_type(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        let actual_type = match value {
            serde_json::Value::String(_) => SchemaType::String,
            serde_json::Value::Number(n) => {
                if n.is_i64() {
                    SchemaType::Integer
                } else {
                    SchemaType::Float
                }
            }
            serde_json::Value::Bool(_) => SchemaType::Boolean,
            serde_json::Value::Array(_) => SchemaType::Array,
            serde_json::Value::Object(_) => SchemaType::Object,
            serde_json::Value::Null => SchemaType::Null,
        };

        if !self.matches_type(&actual_type) {
            return Err(SchemaError::TypeMismatch {
                expected: format!("{:?}", self.schema_type),
                found: format!("{:?}", actual_type),
                path: if path.is_empty() {
                    None
                } else {
                    Some(path.to_string())
                },
            });
        }

        Ok(())
    }

    fn matches_type(&self, actual_type: &SchemaType) -> bool {
        match (&self.schema_type, actual_type) {
            (SchemaType::Integer, SchemaType::Integer) => true,
            (SchemaType::Float, SchemaType::Float) | (SchemaType::Float, SchemaType::Integer) => {
                true
            }
            (a, b) => std::mem::discriminant(a) == std::mem::discriminant(b),
        }
    }

    fn validate_object(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        let obj = value.as_object().ok_or_else(|| SchemaError::TypeMismatch {
            expected: "object".to_string(),
            found: format!("{:?}", value),
            path: if path.is_empty() {
                None
            } else {
                Some(path.to_string())
            },
        })?;

        for field in &self.required {
            if !obj.contains_key(field) {
                return Err(SchemaError::RequiredFieldMissing {
                    field: field.clone(),
                    path: if path.is_empty() {
                        None
                    } else {
                        Some(path.to_string())
                    },
                });
            }
        }

        if let Some(properties) = &self.properties {
            for (key, schema) in properties {
                if let Some(value) = obj.get(key) {
                    let new_path = if path.is_empty() {
                        key.clone()
                    } else {
                        format!("{}.{}", path, key)
                    };
                    schema.validate_with_path(value, &new_path)?;
                }
            }
        }

        Ok(())
    }

    fn validate_array(&self, value: &serde_json::Value, path: &str) -> SchemaResult<()> {
        let arr = value.as_array().ok_or_else(|| SchemaError::TypeMismatch {
            expected: "array".to_string(),
            found: format!("{:?}", value),
            path: if path.is_empty() {
                None
            } else {
                Some(path.to_string())
            },
        })?;

        if let Some(items_schema) = &self.items {
            for (index, item) in arr.iter().enumerate() {
                let new_path = if path.is_empty() {
                    format!("[{}]", index)
                } else {
                    format!("{}[{}]", path, index)
                };
                items_schema.validate_with_path(item, &new_path)?;
            }
        }

        Ok(())
    }
}

pub fn string() -> Schema {
    Schema::new(SchemaType::String)
}

pub fn integer() -> Schema {
    Schema::new(SchemaType::Integer)
}

pub fn float() -> Schema {
    Schema::new(SchemaType::Float)
}

pub fn boolean() -> Schema {
    Schema::new(SchemaType::Boolean)
}

pub fn array() -> Schema {
    Schema::new(SchemaType::Array)
}

pub fn object_schema() -> Schema {
    Schema::new(SchemaType::Object)
}
