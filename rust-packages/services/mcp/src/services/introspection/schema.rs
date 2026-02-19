use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use schemars::{JsonSchema, schema_for, RootSchema};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub enum SchemaType {
    Object,
    Array,
    String,
    Number,
    Integer,
    Boolean,
    Null,
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct SchemaInfo {
    pub name: String,
    pub schema_type: SchemaType,
    pub properties: Option<HashMap<String, SchemaInfo>>,
    pub items: Option<Box<SchemaInfo>>,
    pub required: Option<Vec<String>>,
    pub description: Option<String>,
    pub enum_values: Option<Vec<serde_json::Value>>,
}

#[derive(Debug, Clone, Default)]
pub struct SchemaIntrospector {
    schemas: HashMap<String, SchemaInfo>,
}

impl SchemaIntrospector {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register_schema<T: JsonSchema + 'static>(&mut self, name: &str) {
        let schema = schema_for!(T);
        let schema_info = self.convert_schema(&schema);
        self.schemas.insert(name.to_string(), schema_info);
    }

    pub fn get_schema(&self, name: &str) -> Option<&SchemaInfo> {
        self.schemas.get(name)
    }

    pub fn list_schemas(&self) -> Vec<String> {
        self.schemas.keys().cloned().collect()
    }

    pub fn validate(&self, name: &str, value: &serde_json::Value) -> Result<(), String> {
        let schema = self.get_schema(name).ok_or_else(|| {
            format!("Schema not found: {}", name)
        })?;

        self.validate_against_schema(schema, value)
    }

    fn validate_against_schema(&self, _schema: &SchemaInfo, _value: &serde_json::Value) -> Result<(), String> {
        // Simplified validation logic for now
        Ok(())
    }

    fn convert_schema(&self, _schema: &RootSchema) -> SchemaInfo {
        // Simplified conversion logic for now
        SchemaInfo {
            name: "dynamic".to_string(),
            schema_type: SchemaType::Object,
            properties: None,
            items: None,
            required: None,
            description: None,
            enum_values: None,
        }
    }
}
