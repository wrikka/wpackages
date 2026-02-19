use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;
use std::collections::HashSet;

pub struct ResourceHandler {
    resources: Vec<Resource>,
    subscriptions: HashSet<String>,
}

#[derive(Debug, Clone)]
pub struct Resource {
    pub uri: String,
    pub name: String,
    pub description: Option<String>,
    pub mime_type: Option<String>,
}

impl ResourceHandler {
    pub fn new() -> Self {
        Self {
            resources: Vec::new(),
            subscriptions: HashSet::new(),
        }
    }

    pub fn add_resource(&mut self, resource: Resource) {
        self.resources.push(resource);
    }

    pub fn list_resources(&self, request_id: Id) -> Result<Response> {
        let resources: Vec<serde_json::Value> = self.resources
            .iter()
            .map(|r| {
                json!({
                    "uri": r.uri,
                    "name": r.name,
                    "description": r.description,
                    "mimeType": r.mime_type,
                })
            })
            .collect();

        Ok(Response::success(request_id, json!({ "resources": resources })))
    }

    pub fn read_resource(&self, uri: &str, request_id: Id) -> Result<Response> {
        let resource = self.resources
            .iter()
            .find(|r| r.uri == uri)
            .ok_or_else(|| crate::error::McpError::Protocol(format!("Resource not found: {}", uri)))?;

        let contents = json!([{
            "uri": uri,
            "mimeType": resource.mime_type.as_deref().unwrap_or("text/plain"),
            "text": "Resource content placeholder".to_string(),
        }]);

        Ok(Response::success(request_id, json!({ "contents": contents })))
    }

    pub fn subscribe_resource(&mut self, uri: &str, request_id: Id) -> Result<Response> {
        let _resource = self.resources
            .iter()
            .find(|r| r.uri == uri)
            .ok_or_else(|| crate::error::McpError::Protocol(format!("Resource not found: {}", uri)))?;

        self.subscriptions.insert(uri.to_string());

        Ok(Response::success(request_id, json!({})))
    }

    pub fn unsubscribe_resource(&mut self, uri: &str, request_id: Id) -> Result<Response> {
        if !self.subscriptions.contains(uri) {
            return Err(crate::error::McpError::Protocol(format!("Not subscribed to: {}", uri)));
        }

        self.subscriptions.remove(uri);

        Ok(Response::success(request_id, json!({})))
    }

    pub fn is_subscribed(&self, uri: &str) -> bool {
        self.subscriptions.contains(uri)
    }

    pub fn get_subscriptions(&self) -> Vec<String> {
        self.subscriptions.iter().cloned().collect()
    }
}

impl Default for ResourceHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_resources() {
        let mut handler = ResourceHandler::new();
        handler.add_resource(Resource {
            uri: "file:///test.txt".to_string(),
            name: "Test File".to_string(),
            description: Some("A test file".to_string()),
            mime_type: Some("text/plain".to_string()),
        });

        let response = handler.list_resources(Id::Num(1)).unwrap();
        assert!(response.result.is_some());
    }

    #[test]
    fn test_subscribe_unsubscribe() {
        let mut handler = ResourceHandler::new();
        handler.add_resource(Resource {
            uri: "file:///test.txt".to_string(),
            name: "Test File".to_string(),
            description: None,
            mime_type: None,
        });

        handler.subscribe_resource("file:///test.txt", Id::Num(1)).unwrap();
        assert!(handler.is_subscribed("file:///test.txt"));

        handler.unsubscribe_resource("file:///test.txt", Id::Num(2)).unwrap();
        assert!(!handler.is_subscribed("file:///test.txt"));
    }
}
