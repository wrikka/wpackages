use crate::error::Result;
use crate::types::{NetworkRequest, NetworkResponse};
use async_trait::async_trait;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct InterceptRule {
    pub pattern: String,
    pub action: InterceptAction,
}

#[derive(Debug, Clone)]
pub enum InterceptAction {
    Block,
    Modify { headers: HashMap<String, String> },
    Mock { status: u16, body: String },
    Redirect { url: String },
}

#[async_trait]
pub trait NetworkInterceptService: Send + Sync {
    async fn add_rule(&self, session_id: &str, rule: InterceptRule) -> Result<String>;
    async fn remove_rule(&self, session_id: &str, rule_id: &str) -> Result<()>;
    async fn list_rules(&self, session_id: &str) -> Result<Vec<InterceptRule>>;
    async fn clear_rules(&self, session_id: &str) -> Result<()>;
    async fn get_intercepted_requests(&self, session_id: &str) -> Result<Vec<NetworkRequest>>;
    async fn get_intercepted_responses(&self, session_id: &str) -> Result<Vec<NetworkResponse>>;
}
