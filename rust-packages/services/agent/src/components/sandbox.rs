//! components/sandbox.rs

use crate::services::ToolRegistry;
use crate::types::sandbox::Sandbox;
use crate::types::tool::ToolResult;
use async_trait::async_trait;
use serde_json::Value;

/// A basic sandbox that executes tools directly using a `ToolRegistry`.
#[derive(Clone)]
pub struct DefaultSandbox {
    tool_registry: ToolRegistry,
}

impl DefaultSandbox {
    /// Creates a new `DefaultSandbox` with the given `ToolRegistry`.
    pub fn new(tool_registry: ToolRegistry) -> Self {
        Self { tool_registry }
    }
}

#[async_trait]
impl Sandbox for DefaultSandbox {
    /// Executes a tool by name using the inner `ToolRegistry`.
    async fn execute(&self, tool_name: &str, input: &Value) -> ToolResult {
        self.tool_registry
            .execute(tool_name, input)
            .await
            .unwrap_or_else(|| Err(Box::from(format!("Tool '{}' not found", tool_name))))
    }
}
