use crate::error::{TestingError, TestingResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use tracing::{debug, info};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockRoute {
    pub path: String,
    pub method: HttpMethod,
    pub response: MockResponse,
    pub hit_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub delay_ms: u64,
}

impl Default for MockResponse {
    fn default() -> Self {
        Self {
            status: 200,
            headers: HashMap::new(),
            body: String::new(),
            delay_ms: 0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Head,
    Options,
}

impl std::fmt::Display for HttpMethod {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Get => write!(f, "GET"),
            Self::Post => write!(f, "POST"),
            Self::Put => write!(f, "PUT"),
            Self::Delete => write!(f, "DELETE"),
            Self::Patch => write!(f, "PATCH"),
            Self::Head => write!(f, "HEAD"),
            Self::Options => write!(f, "OPTIONS"),
        }
    }
}

pub struct HttpMockServer {
    routes: Arc<Mutex<Vec<MockRoute>>>,
    port: u16,
    running: Arc<Mutex<bool>>,
}

impl HttpMockServer {
    pub fn new(port: u16) -> Self {
        Self {
            routes: Arc::new(Mutex::new(Vec::new())),
            port,
            running: Arc::new(Mutex::new(false)),
        }
    }

    pub fn with_random_port() -> Self {
        Self::new(0)
    }

    pub async fn mock(&self, method: HttpMethod, path: &str, response: MockResponse) {
        let route = MockRoute {
            path: path.to_string(),
            method,
            response,
            hit_count: 0,
        };

        let mut routes = self.routes.lock().await;
        routes.push(route);
        debug!("Added mock route: {} {}", method, path);
    }

    pub async fn mock_json<T: Serialize>(&self, method: HttpMethod, path: &str, data: &T) -> TestingResult<()> {
        let body = serde_json::to_string(data)
            .map_err(|e| TestingError::http_mock_error(format!("JSON serialization failed: {}", e)))?;

        let mut headers = HashMap::new();
        headers.insert("Content-Type".to_string(), "application/json".to_string());

        self.mock(method, path, MockResponse {
            status: 200,
            headers,
            body,
            delay_ms: 0,
        }).await;

        Ok(())
    }

    pub async fn mock_error(&self, method: HttpMethod, path: &str, status: u16, message: &str) {
        self.mock(method, path, MockResponse {
            status,
            headers: HashMap::new(),
            body: message.to_string(),
            delay_ms: 0,
        }).await;
    }

    pub async fn mock_delay(&self, method: HttpMethod, path: &str, delay_ms: u64) {
        self.mock(method, path, MockResponse {
            status: 200,
            headers: HashMap::new(),
            body: String::new(),
            delay_ms,
        }).await;
    }

    pub async fn get(&self, path: &str, response: MockResponse) {
        self.mock(HttpMethod::Get, path, response).await;
    }

    pub async fn post(&self, path: &str, response: MockResponse) {
        self.mock(HttpMethod::Post, path, response).await;
    }

    pub async fn put(&self, path: &str, response: MockResponse) {
        self.mock(HttpMethod::Put, path, response).await;
    }

    pub async fn delete(&self, path: &str, response: MockResponse) {
        self.mock(HttpMethod::Delete, path, response).await;
    }

    pub async fn verify(&self, method: HttpMethod, path: &str, expected_hits: usize) -> bool {
        let routes = self.routes.lock().await;
        routes
            .iter()
            .find(|r| r.method == method && r.path == path)
            .map(|r| r.hit_count == expected_hits)
            .unwrap_or(false)
    }

    pub async fn hit_count(&self, method: HttpMethod, path: &str) -> usize {
        let routes = self.routes.lock().await;
        routes
            .iter()
            .find(|r| r.method == method && r.path == path)
            .map(|r| r.hit_count)
            .unwrap_or(0)
    }

    pub async fn reset(&self) {
        let mut routes = self.routes.lock().await;
        for route in routes.iter_mut() {
            route.hit_count = 0;
        }
    }

    pub async fn clear(&self) {
        let mut routes = self.routes.lock().await;
        routes.clear();
    }

    pub fn base_url(&self) -> String {
        format!("http://localhost:{}", self.port)
    }

    pub fn port(&self) -> u16 {
        self.port
    }
}

pub fn mock_response() -> MockResponseBuilder {
    MockResponseBuilder::new()
}

pub struct MockResponseBuilder {
    response: MockResponse,
}

impl MockResponseBuilder {
    pub fn new() -> Self {
        Self {
            response: MockResponse::default(),
        }
    }

    pub fn status(mut self, status: u16) -> Self {
        self.response.status = status;
        self
    }

    pub fn header(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.response.headers.insert(key.into(), value.into());
        self
    }

    pub fn body(mut self, body: impl Into<String>) -> Self {
        self.response.body = body.into();
        self
    }

    pub fn json<T: Serialize>(mut self, data: &T) -> TestingResult<Self> {
        self.response.body = serde_json::to_string(data)
            .map_err(|e| TestingError::http_mock_error(format!("JSON serialization failed: {}", e)))?;
        self.response.headers.insert("Content-Type".to_string(), "application/json".to_string());
        Ok(self)
    }

    pub fn delay(mut self, ms: u64) -> Self {
        self.response.delay_ms = ms;
        self
    }

    pub fn build(self) -> MockResponse {
        self.response
    }
}

impl Default for MockResponseBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_mock_server() {
        let server = HttpMockServer::new(8080);

        server.get("/users", mock_response().body("[]").build()).await;

        assert_eq!(server.base_url(), "http://localhost:8080");
    }

    #[tokio::test]
    async fn test_mock_response_builder() {
        let response = mock_response()
            .status(201)
            .header("X-Custom", "value")
            .body("created")
            .build();

        assert_eq!(response.status, 201);
        assert_eq!(response.headers.get("X-Custom"), Some(&"value".to_string()));
    }

    #[test]
    fn test_http_method_display() {
        assert_eq!(format!("{}", HttpMethod::Get), "GET");
        assert_eq!(format!("{}", HttpMethod::Post), "POST");
    }
}
