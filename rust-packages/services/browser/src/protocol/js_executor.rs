use serde::{Deserialize, Serialize};

/// Request to execute JavaScript on the page.
#[derive(Debug, Serialize, Deserialize)]
pub struct ExecuteJsRequest {
    pub session_id: Option<String>,
    pub script: String,
}

/// Result of JavaScript execution.
#[derive(Debug, Serialize, Deserialize)]
pub struct ExecuteJsResponse {
    /// The JSON-serialized return value of the script.
    pub result: serde_json::Value,
}
