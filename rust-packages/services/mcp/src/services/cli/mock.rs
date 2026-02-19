use std::sync::Arc;
use tokio::sync::Mutex;
use serde_json::{json, Value};
use anyhow::Result;

pub struct MockServer {
    tools: Arc<Mutex<Vec<String>>>,
    resources: Arc<Mutex<Vec<String>>>,
}

impl MockServer {
    pub fn new() -> Self {
        Self {
            tools: Arc::new(Mutex::new(vec![
                "mock_tool".to_string(),
                "test_tool".to_string(),
            ])),
            resources: Arc::new(Mutex::new(vec![
                "mock://resource1".to_string(),
                "mock://resource2".to_string(),
            ])),
        }
    }

    pub async fn call_tool(&self, name: &str, _params: Value) -> Result<Value> {
        let tools = self.tools.lock().await;
        
        if tools.contains(&name.to_string()) {
            Ok(json!({
                "result": format!("Mock tool '{}' called", name),
                "success": true
            }))
        } else {
            Err(anyhow::anyhow!("Tool not found: {}", name))
        }
    }

    pub async fn list_tools(&self) -> Result<Vec<String>> {
        Ok(self.tools.lock().await.clone())
    }

    pub async fn read_resource(&self, uri: &str) -> Result<String> {
        let resources = self.resources.lock().await;
        
        if resources.contains(&uri.to_string()) {
            Ok(format!("Mock resource content: {}", uri))
        } else {
            Err(anyhow::anyhow!("Resource not found: {}", uri))
        }
    }

    pub async fn list_resources(&self) -> Result<Vec<String>> {
        Ok(self.resources.lock().await.clone())
    }
}

pub struct MockClient {
    server_url: String,
}

impl MockClient {
    pub fn new(url: &str) -> Self {
        Self {
            server_url: url.to_string(),
        }
    }

    pub async fn connect(&self) -> Result<()> {
        println!("Mock client connected to {}", self.server_url);
        Ok(())
    }

    pub async fn call_tool(&self, name: &str, params: Value) -> Result<Value> {
        Ok(json!({
            "result": format!("Mock client called tool '{}' with params: {:?}", name, params),
            "success": true
        }))
    }

    pub async fn list_tools(&self) -> Result<Vec<String>> {
        Ok(vec!["mock_tool".to_string(), "test_tool".to_string()])
    }
}

pub fn create_mock_server() -> MockServer {
    MockServer::new()
}

pub fn create_mock_client(url: &str) -> MockClient {
    MockClient::new(url)
}
