use crate::error::Result;
use crate::types::{ChatRequest, ChatResponse};
use async_trait::async_trait;
use std::sync::Arc;

/// A trait for middleware that processes requests before they are sent.
#[async_trait]
pub trait RequestMiddleware: Send + Sync {
    async fn pre_process(&self, request: ChatRequest) -> Result<ChatRequest>;
}

/// A trait for middleware that processes responses after they are received.
#[async_trait]
pub trait ResponseMiddleware: Send + Sync {
    async fn post_process(&self, response: ChatResponse) -> Result<ChatResponse>;
}

/// A manager for registering and applying middleware.
#[derive(Default)]
pub struct MiddlewareManager {
    request_middleware: Vec<Arc<dyn RequestMiddleware>>,
    response_middleware: Vec<Arc<dyn ResponseMiddleware>>,
}

impl MiddlewareManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_request_middleware(&mut self, middleware: Arc<dyn RequestMiddleware>) {
        self.request_middleware.push(middleware);
    }

    pub fn add_response_middleware(&mut self, middleware: Arc<dyn ResponseMiddleware>) {
        self.response_middleware.push(middleware);
    }

    pub async fn apply_request_middleware(&self, mut request: ChatRequest) -> Result<ChatRequest> {
        for middleware in &self.request_middleware {
            request = middleware.pre_process(request).await?;
        }
        Ok(request)
    }

    pub async fn apply_response_middleware(&self, mut response: ChatResponse) -> Result<ChatResponse> {
        for middleware in &self.response_middleware {
            response = middleware.post_process(response).await?;
        }
        Ok(response)
    }
}
