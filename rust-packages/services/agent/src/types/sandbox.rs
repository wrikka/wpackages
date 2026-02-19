//! types/sandbox.rs

use crate::types::tool::ToolResult;
use async_trait::async_trait;
use serde_json::Value;

/// A trait for environments that can securely execute tools.
#[async_trait]
pub trait Sandbox: Send + Sync {
    /// Executes a tool within the sandboxed environment.
    async fn execute(&self, tool_name: &str, input: &Value) -> ToolResult;
}
