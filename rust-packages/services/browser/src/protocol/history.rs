use serde::{Deserialize, Serialize};
use crate::protocol::{Action, Params};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActionRecord {
    pub timestamp: String,
    pub action: Action,
    // We may want to redact secrets from params before storing
    pub params: Params,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HistoryResponse {
    pub records: Vec<ActionRecord>,
}
