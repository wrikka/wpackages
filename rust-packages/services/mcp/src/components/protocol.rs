use crate::error::{McpError, Result};
use crate::types::protocol::{Error, Id, JsonRpcMessage, Notification, Request, Response};
use serde_json::Value;
use std::sync::atomic::{AtomicU64, Ordering};

pub struct ProtocolHandler {
    request_counter: AtomicU64,
}

impl ProtocolHandler {
    pub fn new() -> Self {
        Self {
            request_counter: AtomicU64::new(0),
        }
    }

    pub fn parse_message(&self, json: &str) -> Result<JsonRpcMessage> {
        let value: Value = serde_json::from_str(json)
            .map_err(|e| McpError::Protocol(format!("Failed to parse JSON: {}", e)))?;

        self.parse_value(&value)
    }

    fn parse_value(&self, value: &Value) -> Result<JsonRpcMessage> {
        if !value.is_object() {
            return Err(McpError::Protocol("Message must be an object".to_string()));
        }

        let obj = value.as_object().unwrap();

        let jsonrpc = obj.get("jsonrpc").and_then(|v| v.as_str());
        if jsonrpc != Some("2.0") {
            return Err(McpError::Protocol("jsonrpc version must be 2.0".to_string()));
        }

        let method = obj.get("method").and_then(|v| v.as_str());

        if let Some(method) = method {
            if obj.contains_key("id") {
                let id = self.parse_id(obj.get("id").unwrap())?;
                let params = obj.get("params").cloned();

                Ok(JsonRpcMessage::Request(Request {
                    jsonrpc: "2.0".to_string(),
                    id,
                    method: method.to_string(),
                    params,
                }))
            } else {
                let params = obj.get("params").cloned();

                Ok(JsonRpcMessage::Notification(Notification {
                    jsonrpc: "2.0".to_string(),
                    method: method.to_string(),
                    params,
                }))
            }
        } else if obj.contains_key("result") || obj.contains_key("error") {
            let id = self.parse_id(obj.get("id").unwrap())?;
            let result = obj.get("result").cloned();
            let error = obj.get("error")
                .and_then(|v| serde_json::from_value(v.clone()).ok());

            Ok(JsonRpcMessage::Response(Response {
                jsonrpc: "2.0".to_string(),
                id,
                result,
                error,
            }))
        } else {
            Err(McpError::Protocol("Invalid message structure".to_string()))
        }
    }

    fn parse_id(&self, value: &Value) -> Result<Id> {
        if let Some(n) = value.as_i64() {
            Ok(Id::Num(n))
        } else if let Some(s) = value.as_str() {
            Ok(Id::Str(s.to_string()))
        } else {
            Err(McpError::Protocol("Invalid ID format".to_string()))
        }
    }

    pub fn serialize_message(&self, message: &JsonRpcMessage) -> Result<String> {
        serde_json::to_string(message)
            .map_err(|e| McpError::Protocol(format!("Failed to serialize message: {}", e)))
    }

    pub fn create_request(&self, method: impl Into<String>, params: Option<Value>) -> Request {
        let id = self.next_id();
        Request {
            jsonrpc: "2.0".to_string(),
            id,
            method: method.into(),
            params,
        }
    }

    pub fn create_notification(&self, method: impl Into<String>, params: Option<Value>) -> Notification {
        Notification {
            jsonrpc: "2.0".to_string(),
            method: method.into(),
            params,
        }
    }

    pub fn create_response(&self, id: Id, result: Option<Value>, error: Option<Error>) -> Response {
        Response {
            jsonrpc: "2.0".to_string(),
            id,
            result,
            error,
        }
    }

    fn next_id(&self) -> Id {
        Id::Num(self.request_counter.fetch_add(1, Ordering::SeqCst) as i64)
    }
}

impl Default for ProtocolHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_request() {
        let handler = ProtocolHandler::new();
        let json = r#"{"jsonrpc":"2.0","id":1,"method":"test","params":{"foo":"bar"}}"#;

        let message = handler.parse_message(json).unwrap();
        match message {
            JsonRpcMessage::Request(req) => {
                assert_eq!(req.method, "test");
                assert_eq!(req.id, Id::Num(1));
            }
            _ => panic!("Expected request"),
        }
    }

    #[test]
    fn test_parse_notification() {
        let handler = ProtocolHandler::new();
        let json = r#"{"jsonrpc":"2.0","method":"test","params":{"foo":"bar"}}"#;

        let message = handler.parse_message(json).unwrap();
        match message {
            JsonRpcMessage::Notification(notif) => {
                assert_eq!(notif.method, "test");
            }
            _ => panic!("Expected notification"),
        }
    }

    #[test]
    fn test_parse_response() {
        let handler = ProtocolHandler::new();
        let json = r#"{"jsonrpc":"2.0","id":1,"result":{"status":"ok"}}"#;

        let message = handler.parse_message(json).unwrap();
        match message {
            JsonRpcMessage::Response(resp) => {
                assert_eq!(resp.id, Id::Num(1));
                assert!(resp.result.is_some());
            }
            _ => panic!("Expected response"),
        }
    }

    #[test]
    fn test_create_request() {
        let handler = ProtocolHandler::new();
        let req = handler.create_request("test", Some(json!({"foo":"bar"})));

        assert_eq!(req.method, "test");
        assert_eq!(req.jsonrpc, "2.0");
    }

    #[test]
    fn test_serialize_request() {
        let handler = ProtocolHandler::new();
        let req = handler.create_request("test", Some(json!({"foo":"bar"})));
        let message = JsonRpcMessage::Request(req);

        let serialized = handler.serialize_message(&message).unwrap();
        let deserialized: Value = serde_json::from_str(&serialized).unwrap();

        assert_eq!(deserialized["method"], "test");
        assert_eq!(deserialized["jsonrpc"], "2.0");
    }
}
