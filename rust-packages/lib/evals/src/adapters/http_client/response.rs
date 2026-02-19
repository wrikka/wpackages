//! HTTP response wrapper

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// HTTP response wrapper
#[derive(Debug, Clone)]
pub struct HttpResponse<T> {
    pub status_code: u16,
    pub headers: HashMap<String, String>,
    pub body: T,
    pub success: bool,
}

impl<T> HttpResponse<T> {
    /// Create new HTTP response
    pub fn new(
        status_code: u16,
        headers: HashMap<String, String>,
        body: T,
    ) -> Self {
        let success = status_code >= 200 && status_code < 300;

        Self {
            status_code,
            headers,
            body,
            success,
        }
    }

    /// Check if response is successful
    pub fn is_success(&self) -> bool {
        self.success
    }

    /// Check if response is client error (4xx)
    pub fn is_client_error(&self) -> bool {
        self.status_code >= 400 && self.status_code < 500
    }

    /// Check if response is server error (5xx)
    pub fn is_server_error(&self) -> bool {
        self.status_code >= 500 && self.status_code < 600
    }

    /// Get header value
    pub fn get_header(&self, key: &str) -> Option<&String> {
        self.headers.get(key)
    }

    /// Get status text
    pub fn status_text(&self) -> &'static str {
        match self.status_code {
            200 => "OK",
            201 => "Created",
            202 => "Accepted",
            204 => "No Content",
            400 => "Bad Request",
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            409 => "Conflict",
            422 => "Unprocessable Entity",
            429 => "Too Many Requests",
            500 => "Internal Server Error",
            502 => "Bad Gateway",
            503 => "Service Unavailable",
            504 => "Gateway Timeout",
            _ => "Unknown",
        }
    }

    /// Convert response to result
    pub fn into_result(self) -> Result<T, HttpError> {
        if self.success {
            Ok(self.body)
        } else {
            Err(HttpError {
                status_code: self.status_code,
                status_text: self.status_text().to_string(),
                headers: self.headers,
            })
        }
    }

    /// Map response body
    pub fn map<U, F>(self, f: F) -> HttpResponse<U>
    where
        F: FnOnce(T) -> U,
    {
        HttpResponse {
            status_code: self.status_code,
            headers: self.headers,
            body: f(self.body),
            success: self.success,
        }
    }

    /// Map response body with error handling
    pub fn try_map<U, E, F>(self, f: F) -> Result<HttpResponse<U>, E>
    where
        F: FnOnce(T) -> Result<U, E>,
    {
        let body = f(self.body)?;
        Ok(HttpResponse {
            status_code: self.status_code,
            headers: self.headers,
            body,
            success: self.success,
        })
    }
}

/// HTTP error information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpError {
    pub status_code: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
}

impl HttpError {
    /// Create new HTTP error
    pub fn new(status_code: u16, status_text: String) -> Self {
        Self {
            status_code,
            status_text,
            headers: HashMap::new(),
        }
    }

    /// Create new HTTP error with headers
    pub fn with_headers(
        status_code: u16,
        status_text: String,
        headers: HashMap<String, String>,
    ) -> Self {
        Self {
            status_code,
            status_text,
            headers,
        }
    }

    /// Check if error is client error
    pub fn is_client_error(&self) -> bool {
        self.status_code >= 400 && self.status_code < 500
    }

    /// Check if error is server error
    pub fn is_server_error(&self) -> bool {
        self.status_code >= 500 && self.status_code < 600
    }

    /// Check if error is timeout
    pub fn is_timeout(&self) -> bool {
        self.status_code == 408 || self.status_code == 504
    }

    /// Check if error is rate limited
    pub fn is_rate_limited(&self) -> bool {
        self.status_code == 429
    }
}

impl std::fmt::Display for HttpError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "HTTP {}: {}", self.status_code, self.status_text)
    }
}

impl std::error::Error for HttpError {}

impl HttpResponse<()> {
    /// Convert from reqwest response without body
    pub async fn from_reqwest_response_no_body(
        response: reqwest::Response,
    ) -> crate::error::EvalResult<Self> {
        let status_code = response.status().as_u16();
        let headers = response.headers()
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
            .collect();

        Ok(HttpResponse::new(status_code, headers, ()))
    }

    /// Convert from reqwest response with text body
    pub async fn from_reqwest_response_text(
        response: reqwest::Response,
    ) -> crate::error::EvalResult<HttpResponse<String>> {
        let status_code = response.status().as_u16();
        let headers = response.headers()
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
            .collect();

        let body = response
            .text()
            .await
            .map_err(|e| crate::error::EvalError::model_error(format!("Failed to read response body: {}", e)))?;

        Ok(HttpResponse::new(status_code, headers, body))
    }
}

impl<T> HttpResponse<T>
where
    T: for<'de> Deserialize<'de>,
{
    /// Convert from reqwest response with JSON body
    pub async fn from_reqwest_response(
        response: reqwest::Response,
    ) -> crate::error::EvalResult<Self> {
        let status_code = response.status().as_u16();
        let headers = response.headers()
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
            .collect();

        let body = response
            .json()
            .await
            .map_err(|e| crate::error::EvalError::model_error(format!("Failed to parse JSON response: {}", e)))?;

        Ok(HttpResponse::new(status_code, headers, body))
    }
}
