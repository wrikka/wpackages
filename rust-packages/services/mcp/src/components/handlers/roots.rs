use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

#[derive(Debug, Clone)]
pub struct Root {
    pub uri: String,
    pub name: String,
}

pub struct RootsHandler {
    roots: Vec<Root>,
}

impl RootsHandler {
    pub fn new() -> Self {
        Self {
            roots: Vec::new(),
        }
    }

    pub fn add_root(&mut self, root: Root) {
        self.roots.push(root);
    }

    pub fn list_roots(&self, request_id: Id) -> Result<Response> {
        let roots: Vec<serde_json::Value> = self.roots
            .iter()
            .map(|r| {
                json!({
                    "uri": r.uri,
                    "name": r.name,
                })
            })
            .collect();

        Ok(Response::success(request_id, json!({ "roots": roots })))
    }

    pub fn create_list_changed_notification(&self) -> crate::types::protocol::Notification {
        crate::types::protocol::Notification {
            jsonrpc: "2.0".to_string(),
            method: "notifications/roots/list_changed".to_string(),
            params: None,
        }
    }
}

impl Default for RootsHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_roots() {
        let mut handler = RootsHandler::new();
        handler.add_root(Root {
            uri: "file:///projects".to_string(),
            name: "Projects".to_string(),
        });

        let response = handler.list_roots(Id::Num(1)).unwrap();
        assert!(response.result.is_some());
    }
}
