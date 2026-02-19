//! Generic HTTP client adapter

use std::time::Duration;
use serde::{Deserialize, Serialize};

use crate::error::{EvalError, EvalResult};
use super::retry::RetryPolicy;
use super::response::HttpResponse;

/// Generic HTTP client with retry logic
pub struct HttpClient {
    client: reqwest::Client,
    retry_policy: RetryPolicy,
    default_headers: std::collections::HashMap<String, String>,
}

impl HttpClient {
    /// Create new HTTP client
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .user_agent("ai-evals/0.1.0")
            .build()
            .map_err(|e| EvalError::model_error(format!("Failed to create HTTP client: {}", e)))?;

        Self {
            client,
            retry_policy: RetryPolicy::default(),
            default_headers: std::collections::HashMap::new(),
        }
    }

    /// Create HTTP client with custom timeout
    pub fn with_timeout(timeout: Duration) -> Self {
        let client = reqwest::Client::builder()
            .timeout(timeout)
            .user_agent("ai-evals/0.1.0")
            .build()
            .map_err(|e| EvalError::model_error(format!("Failed to create HTTP client: {}", e)))?;

        Self {
            client,
            retry_policy: RetryPolicy::default(),
            default_headers: std::collections::HashMap::new(),
        }
    }

    /// Set retry policy
    pub fn with_retry_policy(mut self, retry_policy: RetryPolicy) -> Self {
        self.retry_policy = retry_policy;
        self
    }

    /// Add default header
    pub fn with_default_header(mut self, key: String, value: String) -> Self {
        self.default_headers.insert(key, value);
        self
    }

    /// Add multiple default headers
    pub fn with_default_headers(mut self, headers: std::collections::HashMap<String, String>) -> Self {
        self.default_headers.extend(headers);
        self
    }

    /// Build request with default headers
    fn build_request(&self, method: reqwest::Method, url: &str) -> reqwest::RequestBuilder {
        let mut request = self.client.request(method, url);

        for (key, value) in &self.default_headers {
            request = request.header(key, value);
        }

        request
    }

    /// Execute request with retry logic
    async fn execute_with_retry<F, T>(&self, request_fn: F) -> EvalResult<T>
    where
        F: Fn() -> std::pin::Pin<Box<dyn std::future::Future<Output = EvalResult<T>> + Send>>,
    {
        let mut last_error = None;

        for attempt in 0..=self.retry_policy.max_retries {
            match request_fn().await {
                Ok(result) => return Ok(result),
                Err(e) => {
                    last_error = Some(e.clone());
                    
                    if attempt < self.retry_policy.max_retries {
                        let delay = self.retry_policy.calculate_delay(attempt);
                        tokio::time::sleep(delay).await;
                    }
                }
            }
        }

        Err(last_error.unwrap_or_else(|| EvalError::model_error("Unknown error")))
    }

    /// Make GET request
    pub async fn get<T>(&self, url: &str) -> EvalResult<HttpResponse<T>>
    where
        T: for<'de> Deserialize<'de>,
    {
        let request_fn = || {
            Box::pin(async {
                let response = self.build_request(reqwest::Method::GET, url)
                    .send()
                    .await
                    .map_err(|e| EvalError::model_error(format!("GET request failed: {}", e)))?;

                HttpResponse::from_reqwest_response(response).await
            })
        };

        self.execute_with_retry(request_fn).await
    }

    /// Make POST request with JSON body
    pub async fn post<T, B>(&self, url: &str, body: &B) -> EvalResult<HttpResponse<T>>
    where
        T: for<'de> Deserialize<'de>,
        B: Serialize,
    {
        let request_fn = || {
            Box::pin(async {
                let response = self.build_request(reqwest::Method::POST, url)
                    .json(body)
                    .send()
                    .await
                    .map_err(|e| EvalError::model_error(format!("POST request failed: {}", e)))?;

                HttpResponse::from_reqwest_response(response).await
            })
        };

        self.execute_with_retry(request_fn).await
    }

    /// Make PUT request with JSON body
    pub async fn put<T, B>(&self, url: &str, body: &B) -> EvalResult<HttpResponse<T>>
    where
        T: for<'de> Deserialize<'de>,
        B: Serialize,
    {
        let request_fn = || {
            Box::pin(async {
                let response = self.build_request(reqwest::Method::PUT, url)
                    .json(body)
                    .send()
                    .await
                    .map_err(|e| EvalError::model_error(format!("PUT request failed: {}", e)))?;

                HttpResponse::from_reqwest_response(response).await
            })
        };

        self.execute_with_retry(request_fn).await
    }

    /// Make DELETE request
    pub async fn delete<T>(&self, url: &str) -> EvalResult<HttpResponse<T>>
    where
        T: for<'de> Deserialize<'de>,
    {
        let request_fn = || {
            Box::pin(async {
                let response = self.build_request(reqwest::Method::DELETE, url)
                    .send()
                    .await
                    .map_err(|e| EvalError::model_error(format!("DELETE request failed: {}", e)))?;

                HttpResponse::from_reqwest_response(response).await
            })
        };

        self.execute_with_retry(request_fn).await
    }

    /// Make POST request with form data
    pub async fn post_form<T>(&self, url: &str, form: reqwest::multipart::Form) -> EvalResult<HttpResponse<T>>
    where
        T: for<'de> Deserialize<'de>,
    {
        let request_fn = || {
            Box::pin(async {
                let response = self.build_request(reqwest::Method::POST, url)
                    .multipart(form.clone())
                    .send()
                    .await
                    .map_err(|e| EvalError::model_error(format!("POST form request failed: {}", e)))?;

                HttpResponse::from_reqwest_response(response).await
            })
        };

        self.execute_with_retry(request_fn).await
    }
}

impl Default for HttpClient {
    fn default() -> Self {
        Self::new()
    }
}
