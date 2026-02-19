use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerInfo {
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub author: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capability {
    pub name: String,
    pub version: String,
    pub enabled: bool,
    pub config: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capabilities {
    pub server_info: ServerInfo,
    pub capabilities: HashMap<String, Capability>,
    pub tools: Vec<String>,
    pub resources: Vec<String>,
    pub prompts: Vec<String>,
}

impl Capabilities {
    pub fn new(server_info: ServerInfo) -> Self {
        Self {
            server_info,
            capabilities: HashMap::new(),
            tools: Vec::new(),
            resources: Vec::new(),
            prompts: Vec::new(),
        }
    }

    pub fn add_capability(&mut self, name: String, capability: Capability) {
        self.capabilities.insert(name, capability);
    }

    pub fn get_capability(&self, name: &str) -> Option<&Capability> {
        self.capabilities.get(name)
    }

    pub fn list_capabilities(&self) -> Vec<String> {
        self.capabilities.keys().cloned().collect()
    }

    pub fn add_tool(&mut self, tool: String) {
        if !self.tools.contains(&tool) {
            self.tools.push(tool);
        }
    }

    pub fn add_resource(&mut self, resource: String) {
        if !self.resources.contains(&resource) {
            self.resources.push(resource);
        }
    }

    pub fn add_prompt(&mut self, prompt: String) {
        if !self.prompts.contains(&prompt) {
            self.prompts.push(prompt);
        }
    }

    pub fn to_json(&self) -> Result<serde_json::Value, serde_json::Error> {
        serde_json::to_value(self)
    }
}
