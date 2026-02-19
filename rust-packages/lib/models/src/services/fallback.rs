//! Fallback mechanism for provider failover
//!
//! This module provides automatic fallback to backup providers.

use crate::error::{AiModelsError, Result};
use crate::types::traits::ChatModel;
use crate::types::*;
use std::sync::Arc;

/// Fallback configuration
#[derive(Debug, Clone)]
pub struct FallbackConfig {
    pub enabled: bool,
    pub max_attempts: u32,
}

impl Default for FallbackConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_attempts: 3,
        }
    }
}

/// Fallback manager for provider failover
pub struct FallbackManager {
    config: FallbackConfig,
}

impl FallbackManager {
    pub fn new(config: FallbackConfig) -> Self {
        Self { config }
    }

    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.config.enabled = enabled;
        self
    }

    pub fn with_max_attempts(mut self, max_attempts: u32) -> Self {
        self.config.max_attempts = max_attempts;
        self
    }

    /// Execute chat with fallback to backup providers
    pub async fn chat_with_fallback<F, Fut>(
        &self,
        providers: Vec<Arc<dyn ChatModel>>,
        _request: ChatRequest,
        mut create_request: F,
    ) -> Result<ChatResponse>
    where
        F: FnMut() -> Fut,
        Fut: std::future::Future<Output = ChatRequest>,
    {
        if !self.config.enabled || providers.is_empty() {
            return Err(AiModelsError::InvalidInput(
                "No providers available".to_string(),
            ));
        }

        let mut last_error = None;
        let max_providers = std::cmp::min(self.config.max_attempts as usize, providers.len());

        for i in 0..max_providers {
            let provider = providers.get(i).unwrap();
            let req = create_request().await;

            match provider.chat(req).await {
                Ok(response) => {
                    if i > 0 {
                        tracing::info!("Fallback succeeded on attempt {}", i + 1);
                    }
                    return Ok(response);
                }
                Err(e) => {
                    tracing::warn!(
                        "Provider {:?} failed: {:?}",
                        provider.provider_type().as_str(),
                        e
                    );
                    last_error = Some(e);
                }
            }
        }

        Err(last_error.unwrap_or_else(|| AiModelsError::RetryExhausted {
            attempts: max_providers as u32,
        }))
    }
}

impl Default for FallbackManager {
    fn default() -> Self {
        Self::new(FallbackConfig::default())
    }
}
