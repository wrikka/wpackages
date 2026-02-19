//! # Tool Registration Service
//!
//! Service for registering tools from extensions for AI Agent use.

use crate::error::{AppError, Result};
use crate::types::{ExtensionId, ToolDefinition};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Service for managing tool registrations from extensions
pub struct ToolRegistry {
    /// Registered tools by name
    tools: HashMap<String, RegisteredTool>,
    /// Tools by extension
    tools_by_extension: HashMap<ExtensionId, Vec<String>>,
}

/// A registered tool from an extension
#[derive(Debug, Clone)]
pub struct RegisteredTool {
    /// Tool name
    pub name: String,
    /// Extension that owns this tool
    pub extension_id: ExtensionId,
    /// Tool definition
    pub definition: ToolDefinition,
    /// Whether the tool is enabled
    pub enabled: bool,
}

impl ToolRegistry {
    /// Create a new tool registry
    pub fn new() -> Self {
        Self {
            tools: HashMap::new(),
            tools_by_extension: HashMap::new(),
        }
    }

    /// Register a tool from an extension
    pub fn register_tool(&mut self, extension_id: ExtensionId, tool: ToolDefinition) -> Result<()> {
        if self.tools.contains_key(&tool.name) {
            return Err(AppError::ToolAlreadyExists(tool.name));
        }

        let registered_tool = RegisteredTool {
            name: tool.name.clone(),
            extension_id: extension_id.clone(),
            definition: tool,
            enabled: true,
        };

        self.tools
            .insert(registered_tool.name.clone(), registered_tool.clone());
        self.tools_by_extension
            .entry(extension_id)
            .or_default()
            .push(registered_tool.name);

        Ok(())
    }

    /// Unregister all tools from an extension
    pub fn unregister_extension_tools(&mut self, extension_id: &ExtensionId) {
        if let Some(tool_names) = self.tools_by_extension.remove(extension_id) {
            for name in tool_names {
                self.tools.remove(&name);
            }
        }
    }

    /// Get a tool by name
    pub fn get_tool(&self, name: &str) -> Option<&RegisteredTool> {
        self.tools.get(name)
    }

    /// Get all tools
    pub fn get_all_tools(&self) -> Vec<&RegisteredTool> {
        self.tools.values().collect()
    }

    /// Get tools by extension
    pub fn get_tools_by_extension(&self, extension_id: &ExtensionId) -> Vec<&RegisteredTool> {
        self.tools_by_extension
            .get(extension_id)
            .map(|names| {
                names
                    .iter()
                    .filter_map(|name| self.tools.get(name))
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Enable a tool
    pub fn enable_tool(&mut self, name: &str) -> Result<()> {
        if let Some(tool) = self.tools.get_mut(name) {
            tool.enabled = true;
            Ok(())
        } else {
            Err(AppError::ToolNotFound(name.to_string()))
        }
    }

    /// Disable a tool
    pub fn disable_tool(&mut self, name: &str) -> Result<()> {
        if let Some(tool) = self.tools.get_mut(name) {
            tool.enabled = false;
            Ok(())
        } else {
            Err(AppError::ToolNotFound(name.to_string()))
        }
    }
}

impl Default for ToolRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Shared tool registry for async contexts
pub type SharedToolRegistry = Arc<RwLock<ToolRegistry>>;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::ToolInputSchema;

    #[test]
    fn test_register_tool() {
        let mut registry = ToolRegistry::new();
        let extension_id = ExtensionId::new("test-extension");

        let tool = ToolDefinition {
            name: "test_tool".to_string(),
            description: "Test tool".to_string(),
            input_schema: ToolInputSchema::Object {
                properties: HashMap::new(),
                required: Vec::new(),
            },
        };

        assert!(registry.register_tool(extension_id.clone(), tool).is_ok());
        assert!(registry.get_tool("test_tool").is_some());
    }

    #[test]
    fn test_unregister_extension_tools() {
        let mut registry = ToolRegistry::new();
        let extension_id = ExtensionId::new("test-extension");

        let tool = ToolDefinition {
            name: "test_tool".to_string(),
            description: "Test tool".to_string(),
            input_schema: ToolInputSchema::Object {
                properties: HashMap::new(),
                required: Vec::new(),
            },
        };

        registry.register_tool(extension_id.clone(), tool).unwrap();
        registry.unregister_extension_tools(&extension_id);
        assert!(registry.get_tool("test_tool").is_none());
    }
}
