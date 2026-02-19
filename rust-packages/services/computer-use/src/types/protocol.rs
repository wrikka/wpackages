//! Protocol types for IPC communication

use serde::{Deserialize, Serialize};
use crate::types::Action;

/// Command for daemon execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    pub id: String,
    pub action: Action,
    pub params: serde_json::Value,
}

impl Command {
    pub fn new(action: Action, params: serde_json::Value) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            action,
            params,
        }
    }
}

/// Response from daemon
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub id: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

impl Response {
    pub fn success(id: impl Into<String>, data: Option<serde_json::Value>) -> Self {
        Self {
            id: id.into(),
            success: true,
            data,
            error: None,
        }
    }

    pub fn error(id: impl Into<String>, error: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            success: false,
            data: None,
            error: Some(error.into()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_command_response() {
        let cmd = Command::new(Action::Snapshot, serde_json::json!({}));
        let resp = Response::success(&cmd.id, None);
        assert!(resp.success);
    }
}
