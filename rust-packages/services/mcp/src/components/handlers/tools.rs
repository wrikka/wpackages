use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

pub struct ToolHandler {
    tools: Vec<Tool>,
}

#[derive(Debug, Clone)]
pub struct Tool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

impl ToolHandler {
    pub fn new() -> Self {
        Self {
            tools: Vec::new(),
        }
    }

    pub fn add_tool(&mut self, tool: Tool) {
        self.tools.push(tool);
    }

    pub fn list_tools(&self, request_id: Id) -> Result<Response> {
        let tools: Vec<serde_json::Value> = self.tools
            .iter()
            .map(|t| {
                json!({
                    "name": t.name,
                    "description": t.description,
                    "inputSchema": t.input_schema,
                })
            })
            .collect();

        Ok(Response::success(request_id, json!({ "tools": tools })))
    }

    pub fn call_tool(&self, name: &str, args: serde_json::Value, request_id: Id) -> Result<Response> {
        let _tool = self.tools
            .iter()
            .find(|t| t.name == name)
            .ok_or_else(|| crate::error::McpError::Protocol(format!("Tool not found: {}", name)))?;

        let content = json!([{
            "type": "text",
            "text": format!("Tool '{}' called with args: {}", name, args),
        }]);

        Ok(Response::success(request_id, json!({ "content": content, "isError": false })))
    }
}

impl Default for ToolHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_tools() {
        let mut handler = ToolHandler::new();
        handler.add_tool(Tool {
            name: "test_tool".to_string(),
            description: "A test tool".to_string(),
            input_schema: json!({ "type": "object" }),
        });

        let response = handler.list_tools(Id::Num(1)).unwrap();
        assert!(response.result.is_some());
    }
}
