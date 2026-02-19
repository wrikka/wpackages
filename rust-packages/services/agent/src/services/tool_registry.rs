//! services/tool_registry.rs

use crate::types::tool::{Tool, ToolResult};
use std::collections::HashMap;
use std::sync::Arc;
use serde_json::Value;

/// A registry for discovering and executing tools.
#[derive(Clone, Default)]
pub struct ToolRegistry {
    tools: HashMap<&'static str, Arc<dyn Tool>>,
}

impl ToolRegistry {
    /// Creates a new, empty `ToolRegistry`.
    pub fn new() -> Self {
        Self::default()
    }

    /// Registers a new tool.
    pub fn register(&mut self, tool: impl Tool + 'static) {
        self.tools.insert(tool.name(), Arc::new(tool));
    }

    /// Executes a tool by name with the given input.
    pub async fn execute(&self, tool_name: &str, input: &Value) -> Option<ToolResult> {
        self.tools.get(tool_name).map(|tool| tool.execute(input))
    }
}
