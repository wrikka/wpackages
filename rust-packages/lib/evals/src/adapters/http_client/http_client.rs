//! HTTP client adapter for external API calls

use std::time::Duration;
use serde::{Deserialize, Serialize};

/// HTTP client adapter
pub struct HttpClient {
    client: reqwest::Client,
    base_url: String,
    default_headers: std::collections::HashMap<String, String>,
}

impl HttpClient {
    /// Create a new HTTP client
    pub fn new(base_url: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            base_url,
            default_headers: std::collections::HashMap::new(),
        }
    }

    /// Set default header
    pub fn with_default_header(mut self, key: String, value: String) -> Self {
        self.default_headers.insert(key, value);
        self
    }

    /// Set timeout
    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.client = reqwest::Client::builder()
            .timeout(timeout)
            .build()
            .expect("Failed to create HTTP client");
        self
    }

    /// Build request with default headers
    fn build_request(&self, method: reqwest::Method, path: &str) -> reqwest::RequestBuilder {
        let url = if path.starts_with("http") {
            path.to_string()
        } else {
            format!("{}/{}", self.base_url.trim_end_matches('/'), path.trim_start_matches('/'))
        };

        let mut request = self.client.request(method, &url);

        for (key, value) in &self.default_headers {
            request = request.header(key, value);
        }

        request
    }

    /// Make GET request
    pub async fn get<T>(&self, path: &str) -> crate::error::EvalResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        let response = self.build_request(reqwest::Method::GET, path)
            .send()
            .await
            .map_err(|e| crate::error::EvalError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("HTTP request failed: {}", e)
            )))?;

        self.handle_response(response).await
    }

    /// Make POST request
    pub async fn post<T>(&self, path: &str, body: &impl Serialize) -> crate::error::EvalResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        let response = self.build_request(reqwest::Method::POST, path)
            .json(body)
            .send()
            .await
            .map_err(|e| crate::error::EvalError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("HTTP request failed: {}", e)
            )))?;

        self.handle_response(response).await
    }

    /// Make PUT request
    pub async fn put<T>(&self, path: &str, body: &impl Serialize) -> crate::error::EvalResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        let response = self.build_request(reqwest::Method::PUT, path)
            .json(body)
            .send()
            .await
            .map_err(|e| crate::error::EvalError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("HTTP request failed: {}", e)
            )))?;

        self.handle_response(response).await
    }

    /// Make DELETE request
    pub async fn delete<T>(&self, path: &str) -> crate::error::EvalResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        let response = self.build_request(reqwest::Method::DELETE, path)
            .send()
            .await
            .map_err(|e| crate::error::EvalError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("HTTP request failed: {}", e)
            )))?;

        self.handle_response(response).await
    }

    /// Handle HTTP response
    async fn handle_response<T>(&self, response: reqwest::Response) -> crate::error::EvalResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Failed to read error response".to_string());

            return Err(crate::error::EvalError::model_error(
                format!("HTTP request failed with status {}: {}", status, error_text)
            ));
        }

        let text = response
            .text()
            .await
            .map_err(|e| crate::error::EvalError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to read response: {}", e)
            )))?;

        serde_json::from_str(&text)
            .map_err(|e| crate::error::EvalError::SerializationError(e))
    }
}

/// HTTP response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpResponse<T> {
    pub data: T,
    pub status: u16,
    pub message: Option<String>,
}

impl<T> HttpResponse<T> {
    /// Create new HTTP response
    pub fn new(data: T, status: u16) -> Self {
        Self {
            data,
            status,
            message: None,
        }
    }

    /// Create response with message
    pub fn with_message(mut self, message: String) -> Self {
        self.message = Some(message);
        self
    }
}

/// Error response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub status: u16,
    pub details: Option<serde_json::Value>,
}

impl ErrorResponse {
    /// Create new error response
    pub fn new(error: String, status: u16) -> Self {
        Self {
            error,
            status,
            details: None,
        }
    }

    /// Create error response with details
    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = Some(details);
        self
    }
}
