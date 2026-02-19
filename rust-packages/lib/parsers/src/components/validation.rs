use crate::error::{ParseError, Result};
use jsonschema::JSONSchema;
use serde_json::Value;

pub struct SchemaValidator {
    schema: JSONSchema,
}

impl SchemaValidator {
    pub fn new(schema: &Value) -> Result<Self> {
        let schema = JSONSchema::compile(schema)
            .map_err(|e| ParseError::Schema(format!("Schema compilation error: {}", e)))?;
        Ok(Self { schema })
    }

    pub fn validate(&self, data: &Value) -> Result<()> {
        let result = self.schema.validate(data);
        if result.is_valid() {
            Ok(())
        } else {
            let errors: Vec<String> = result
                .flat_map(|e| e.instance_path.to_string())
                .collect();
            Err(ParseError::Schema(format!("Validation errors: {:?}", errors)))
        }
    }
}

pub fn validate_json_with_schema(data: &Value, schema: &Value) -> Result<()> {
    let validator = SchemaValidator::new(schema)?;
    validator.validate(data)
}

pub fn validate_toml_with_schema(data: &Value, schema: &Value) -> Result<()> {
    // Convert TOML to JSON for validation
    let json_data = serde_json::to_value(data).map_err(ParseError::Json)?;
    validate_json_with_schema(&json_data, schema)
}

pub fn validate_xml_with_schema(data: &Value, schema: &Value) -> Result<()> {
    // Convert XML to JSON for validation
    let json_data = serde_json::to_value(data).map_err(ParseError::Json)?;
    validate_json_with_schema(&json_data, schema)
}

pub fn validate_yaml_with_schema(data: &Value, schema: &Value) -> Result<()> {
    // Convert YAML to JSON for validation
    let json_data = serde_json::to_value(data).map_err(ParseError::Json)?;
    validate_json_with_schema(&json_data, schema)
}

// Predefined schemas for common formats
pub fn json_schema() -> Value {
    serde_json::json!({
        "type": "object",
        "additionalProperties": true
    })
}

pub fn toml_schema() -> Value {
    serde_json::json!({
        "type": "object",
        "additionalProperties": true,
        "properties": {
            "package": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "version": {"type": "string"}
                }
            }
        }
    })
}
