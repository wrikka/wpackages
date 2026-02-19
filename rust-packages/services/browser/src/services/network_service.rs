use crate::error::Result;
use crate::types::{NetworkRequest, NetworkResponse};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::RwLock;

#[async_trait]
pub trait NetworkService: Send + Sync {
    async fn intercept_request(&self, session_id: &str, request: NetworkRequest) -> Result<()>;
    async fn intercept_response(&self, session_id: &str, response: NetworkResponse) -> Result<()>;
    async fn get_requests(&self, session_id: &str) -> Result<Vec<NetworkRequest>>;
    async fn get_responses(&self, session_id: &str) -> Result<Vec<NetworkResponse>>;
    async fn block_pattern(&self, session_id: &str, pattern: &str) -> Result<()>;
    async fn mock_response(
        &self,
        session_id: &str,
        url_pattern: &str,
        response: NetworkResponse,
    ) -> Result<()>;
}

pub struct InMemoryNetworkService {
    requests: RwLock<HashMap<String, Vec<NetworkRequest>>>,
    responses: RwLock<HashMap<String, Vec<NetworkResponse>>>,
}

impl InMemoryNetworkService {
    pub fn new() -> Self {
        Self {
            requests: RwLock::new(HashMap::new()),
            responses: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryNetworkService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl NetworkService for InMemoryNetworkService {
    async fn intercept_request(&self, session_id: &str, request: NetworkRequest) -> Result<()> {
        self.requests
            .write()
            .unwrap()
            .entry(session_id.to_string())
            .or_default()
            .push(request);
        Ok(())
    }

    async fn intercept_response(&self, session_id: &str, response: NetworkResponse) -> Result<()> {
        self.responses
            .write()
            .unwrap()
            .entry(session_id.to_string())
            .or_default()
            .push(response);
        Ok(())
    }

    async fn get_requests(&self, session_id: &str) -> Result<Vec<NetworkRequest>> {
        Ok(self.requests.read().unwrap().get(session_id).cloned().unwrap_or_default())
    }

    async fn get_responses(&self, session_id: &str) -> Result<Vec<NetworkResponse>> {
        Ok(self.responses.read().unwrap().get(session_id).cloned().unwrap_or_default())
    }

    async fn block_pattern(&self, _session_id: &str, _pattern: &str) -> Result<()> {
        Ok(())
    }

    async fn mock_response(
        &self,
        _session_id: &str,
        _url_pattern: &str,
        _response: NetworkResponse,
    ) -> Result<()> {
        Ok(())
    }
}
