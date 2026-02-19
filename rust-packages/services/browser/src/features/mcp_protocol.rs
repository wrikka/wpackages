use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Model Context Protocol (MCP) Implementation
/// Allows browser-use to integrate with AI assistants like Claude

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServer {
    pub name: String,
    pub version: String,
    pub capabilities: McpCapabilities,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpCapabilities {
    pub tools: Vec<McpTool>,
    pub resources: Vec<McpResource>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpTool {
    pub name: String,
    pub description: String,
    pub parameters: McpParameters,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResource {
    pub uri: String,
    pub name: String,
    pub description: String,
    pub mime_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpParameters {
    #[serde(rename = "type")]
    pub param_type: String,
    pub properties: HashMap<String, McpProperty>,
    pub required: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpProperty {
    #[serde(rename = "type")]
    pub prop_type: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "method")]
pub enum McpRequest {
    #[serde(rename = "initialize")]
    Initialize { params: InitializeParams },
    #[serde(rename = "tools/list")]
    ToolsList,
    #[serde(rename = "tools/call")]
    ToolsCall { params: ToolsCallParams },
    #[serde(rename = "resources/list")]
    ResourcesList,
    #[serde(rename = "resources/read")]
    ResourcesRead { params: ResourcesReadParams },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializeParams {
    pub protocol_version: String,
    pub capabilities: ClientCapabilities,
    pub client_info: ClientInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientCapabilities {
    pub tools: Option<ToolCapability>,
    pub resources: Option<ResourceCapability>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCapability {
    pub list_changed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceCapability {
    pub subscribe: bool,
    pub list_changed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientInfo {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolsCallParams {
    pub name: String,
    pub arguments: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourcesReadParams {
    pub uri: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResponse {
    pub jsonrpc: String,
    pub id: Option<u64>,
    #[serde(flatten)]
    pub result: McpResult,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum McpResult {
    Success { result: serde_json::Value },
    Error { error: McpError },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

pub struct McpHandler;

impl McpHandler {
    pub fn new() -> Self {
        Self
    }

    pub fn create_server_info() -> McpServer {
        let mut properties = HashMap::new();
        properties.insert(
            "url".to_string(),
            McpProperty {
                prop_type: "string".to_string(),
                description: "URL to navigate to".to_string(),
            },
        );
        properties.insert(
            "selector".to_string(),
            McpProperty {
                prop_type: "string".to_string(),
                description: "CSS selector for element".to_string(),
            },
        );
        properties.insert(
            "text".to_string(),
            McpProperty {
                prop_type: "string".to_string(),
                description: "Text to type or content to extract".to_string(),
            },
        );

        McpServer {
            name: "browser-use".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            capabilities: McpCapabilities {
                tools: vec![
                    McpTool {
                        name: "browser_navigate".to_string(),
                        description: "Navigate to a URL".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: {
                                let mut p = HashMap::new();
                                p.insert(
                                    "url".to_string(),
                                    McpProperty {
                                        prop_type: "string".to_string(),
                                        description: "URL to navigate to".to_string(),
                                    },
                                );
                                p
                            },
                            required: vec!["url".to_string()],
                        },
                    },
                    McpTool {
                        name: "browser_click".to_string(),
                        description: "Click an element on the page".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: {
                                let mut p = HashMap::new();
                                p.insert(
                                    "selector".to_string(),
                                    McpProperty {
                                        prop_type: "string".to_string(),
                                        description: "CSS selector for element to click".to_string(),
                                    },
                                );
                                p
                            },
                            required: vec!["selector".to_string()],
                        },
                    },
                    McpTool {
                        name: "browser_type".to_string(),
                        description: "Type text into an input field".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: {
                                let mut p = HashMap::new();
                                p.insert(
                                    "selector".to_string(),
                                    McpProperty {
                                        prop_type: "string".to_string(),
                                        description: "CSS selector for input field".to_string(),
                                    },
                                );
                                p.insert(
                                    "text".to_string(),
                                    McpProperty {
                                        prop_type: "string".to_string(),
                                        description: "Text to type".to_string(),
                                    },
                                );
                                p
                            },
                            required: vec!["selector".to_string(), "text".to_string()],
                        },
                    },
                    McpTool {
                        name: "browser_get_text".to_string(),
                        description: "Extract text content from an element".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: {
                                let mut p = HashMap::new();
                                p.insert(
                                    "selector".to_string(),
                                    McpProperty {
                                        prop_type: "string".to_string(),
                                        description: "CSS selector for element".to_string(),
                                    },
                                );
                                p
                            },
                            required: vec!["selector".to_string()],
                        },
                    },
                    McpTool {
                        name: "browser_screenshot".to_string(),
                        description: "Take a screenshot of the current page".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: HashMap::new(),
                            required: vec![],
                        },
                    },
                    McpTool {
                        name: "browser_get_title".to_string(),
                        description: "Get the current page title".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: HashMap::new(),
                            required: vec![],
                        },
                    },
                    McpTool {
                        name: "browser_get_url".to_string(),
                        description: "Get the current page URL".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: HashMap::new(),
                            required: vec![],
                        },
                    },
                    McpTool {
                        name: "browser_find_element".to_string(),
                        description: "Find an element by natural language description".to_string(),
                        parameters: McpParameters {
                            param_type: "object".to_string(),
                            properties: {
                                let mut p = HashMap::new();
                                p.insert(
                                    "description".to_string(),
                                    McpProperty {
                                        prop_type: "string".to_string(),
                                        description: "Natural language description of element".to_string(),
                                    },
                                );
                                p
                            },
                            required: vec!["description".to_string()],
                        },
                    },
                ],
                resources: vec![
                    McpResource {
                        uri: "browser://current-page".to_string(),
                        name: "Current Page".to_string(),
                        description: "HTML content of the current page".to_string(),
                        mime_type: "text/html".to_string(),
                    },
                    McpResource {
                        uri: "browser://snapshot".to_string(),
                        name: "Page Snapshot".to_string(),
                        description: "Accessibility tree snapshot of the page".to_string(),
                        mime_type: "application/json".to_string(),
                    },
                ],
            },
        }
    }

    pub fn handle_request(&self, request: McpRequest) -> McpResponse {
        match request {
            McpRequest::Initialize { params } => {
                let server_info = Self::create_server_info();
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id: Some(1),
                    result: McpResult::Success {
                        result: serde_json::json!({
                            "protocolVersion": "2024-11-05",
                            "serverInfo": {
                                "name": server_info.name,
                                "version": server_info.version
                            },
                            "capabilities": {
                                "tools": { "listChanged": true },
                                "resources": { "subscribe": true, "listChanged": true }
                            }
                        }),
                    },
                }
            }
            McpRequest::ToolsList => {
                let server_info = Self::create_server_info();
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id: Some(2),
                    result: McpResult::Success {
                        result: serde_json::json!({
                            "tools": server_info.capabilities.tools
                        }),
                    },
                }
            }
            McpRequest::ToolsCall { params } => {
                // Tool calls would be handled by the daemon
                // This is just the protocol layer
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id: Some(3),
                    result: McpResult::Success {
                        result: serde_json::json!({
                            "content": [{
                                "type": "text",
                                "text": format!("Tool '{}' called successfully", params.name)
                            }]
                        }),
                    },
                }
            }
            McpRequest::ResourcesList => {
                let server_info = Self::create_server_info();
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id: Some(4),
                    result: McpResult::Success {
                        result: serde_json::json!({
                            "resources": server_info.capabilities.resources
                        }),
                    },
                }
            }
            McpRequest::ResourcesRead { params } => {
                McpResponse {
                    jsonrpc: "2.0".to_string(),
                    id: Some(5),
                    result: McpResult::Success {
                        result: serde_json::json!({
                            "contents": [{
                                "uri": params.uri,
                                "mimeType": "text/html",
                                "text": "<html><body>Page content would be here</body></html>"
                            }]
                        }),
                    },
                }
            }
        }
    }

    pub fn parse_request(&self, json: &str) -> Result<McpRequest, serde_json::Error> {
        serde_json::from_str(json)
    }

    pub fn serialize_response(&self, response: &McpResponse) -> Result<String, serde_json::Error> {
        serde_json::to_string(response)
    }
}

impl Default for McpHandler {
    fn default() -> Self {
        Self::new()
    }
}
