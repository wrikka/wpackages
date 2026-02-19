use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkRequest {
    pub id: String,
    pub url: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl NetworkRequest {
    pub fn new(id: impl Into<String>, url: impl Into<String>, method: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            url: url.into(),
            method: method.into(),
            headers: HashMap::new(),
            body: None,
            timestamp: Utc::now(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkResponse {
    pub request_id: String,
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl NetworkResponse {
    pub fn new(request_id: impl Into<String>, status: u16) -> Self {
        Self {
            request_id: request_id.into(),
            status,
            headers: HashMap::new(),
            body: None,
            timestamp: Utc::now(),
        }
    }
}
