//! types/tool.rs

use async_trait::async_trait;
use crate::types::safety::Effect;
use crate::types::tool::ToolResult;
use serde_json::Value;
use std::collections::HashMap;
use std::error::Error;

/// Represents the output of a tool's execution.
pub type ToolResult = Result<Value, Box<dyn Error + Send + Sync>>;

/// A trait defining a callable tool that an agent can execute.
#[async_trait]
pub trait Tool: Send + Sync {
    /// The name of the tool, used for identification.
    fn name(&self) -> &'static str;
    /// A description of what the tool does, used by the agent for planning.
    fn description(&self) -> &'static str;
    /// Declares the potential side effects of executing this tool.
    fn effects(&self) -> Vec<Effect> { vec![Effect::Pure] } // Default to pure
    /// Executes the tool with a given JSON value as input.
    async fn execute(&self, input: &Value) -> ToolResult;
}
