use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ToolInputSchema {
    #[serde(default)]
    pub r#type: String,
    #[serde(default)]
    pub properties: serde_json::Value,
    #[serde(default)]
    pub required: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct PromptArgumentSchema {
    pub name: String,
    pub description: Option<String>,
    pub required: bool,
    #[serde(default)]
    pub r#type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ResourceContentSchema {
    pub uri: String,
    #[serde(rename = "mimeType")]
    pub mime_type: Option<String>,
    pub text: Option<String>,
    pub blob: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct TaskParameterSchema {
    #[serde(default)]
    pub r#type: String,
    #[serde(default)]
    pub description: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tool_input_schema() {
        let schema = ToolInputSchema {
            r#type: "object".to_string(),
            properties: json!({}),
            required: vec![],
        };
        assert_eq!(schema.r#type, "object");
    }
}
