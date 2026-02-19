use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

/// Represents a tool that an AI model can call.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Tool {
    /// The name of the tool.
    pub name: String,
    /// A description of what the tool does.
    pub description: String,
    /// The JSON schema for the tool's parameters.
    pub parameters: JsonValue,
}

/// Represents the result of a tool's execution.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ToolResult {
    /// The ID of the tool call this result corresponds to.
    pub tool_call_id: String,
    /// The content of the tool's output.
    pub content: String,
}
