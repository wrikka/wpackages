//! # Tool Types
//!
//! Types for defining tools that can be used by AI Agents.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Definition of a tool that can be registered by extensions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolDefinition {
    /// Unique name of the tool
    pub name: String,
    /// Human-readable description
    pub description: String,
    /// Schema for tool input parameters
    pub input_schema: ToolInputSchema,
}

/// Schema for tool input parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "schema")]
pub enum ToolInputSchema {
    /// Object with named properties
    Object {
        properties: HashMap<String, PropertySchema>,
        required: Vec<String>,
    },
    /// Single string parameter
    String,
    /// No parameters
    None,
}

/// Schema for a single property
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertySchema {
    /// Property type
    #[serde(rename = "type")]
    pub type_: PropertyType,
    /// Property description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Whether the property is optional
    #[serde(default)]
    pub optional: bool,
    /// Default value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default: Option<serde_json::Value>,
}

/// Property type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PropertyType {
    String,
    Number,
    Integer,
    Boolean,
    Array,
    Object,
}

impl ToolDefinition {
    /// Create a new tool definition
    pub fn new(name: impl Into<String>, description: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            description: description.into(),
            input_schema: ToolInputSchema::None,
        }
    }

    /// Set the input schema
    pub fn with_input_schema(mut self, schema: ToolInputSchema) -> Self {
        self.input_schema = schema;
        self
    }

    /// Create a tool with no parameters
    pub fn simple(name: impl Into<String>, description: impl Into<String>) -> Self {
        Self::new(name, description)
    }

    /// Create a tool with string input
    pub fn with_string_input(name: impl Into<String>, description: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            description: description.into(),
            input_schema: ToolInputSchema::String,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_simple_tool() {
        let tool = ToolDefinition::simple("test_tool", "A test tool");
        assert_eq!(tool.name, "test_tool");
        assert!(matches!(tool.input_schema, ToolInputSchema::None));
    }

    #[test]
    fn test_create_tool_with_schema() {
        let mut properties = HashMap::new();
        properties.insert(
            "path".to_string(),
            PropertySchema {
                type_: PropertyType::String,
                description: Some("File path".to_string()),
                optional: false,
                default: None,
            },
        );

        let schema = ToolInputSchema::Object {
            properties,
            required: vec!["path".to_string()],
        };

        let tool = ToolDefinition::new("read_file", "Read a file").with_input_schema(schema);

        assert_eq!(tool.name, "read_file");
    }
}
