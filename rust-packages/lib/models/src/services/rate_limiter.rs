//! Rate limiting service
//!
//! This module provides rate limiting functionality per provider.

use crate::config::RateLimitConfig;
use crate::error::{AiModelsError, Result};
use crate::types::ProviderType;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Rate limiter for a single provider
struct ProviderRateLimiter {
    config: RateLimitConfig,
    minute_requests: Vec<Instant>,
    hour_requests: Vec<Instant>,
    day_requests: Vec<Instant>,
}

impl ProviderRateLimiter {
    fn new(config: RateLimitConfig) -> Self {
        Self {
            config,
            minute_requests: Vec::new(),
            hour_requests: Vec::new(),
            day_requests: Vec::new(),
        }
    }

    fn check_and_record(&mut self) -> Result<()> {
        let now = Instant::now();

        // Clean old requests and check limits
        if let Some(limit) = self.config.requests_per_minute {
            self.minute_requests.retain(|t| now.duration_since(*t) < Duration::from_secs(60));
            if self.minute_requests.len() >= limit as usize {
                return Err(AiModelsError::RateLimitExceeded {
                    limit,
                    window: "minute".to_string(),
                });
            }
            self.minute_requests.push(now);
        }

        // NOTE: The RateLimitConfig currently only supports requests_per_minute.
        // Additional logic for tokens, hour, and day can be added here.

        Ok(())
    }

    fn get_remaining(&self) -> Option<u32> {
        self.config.requests_per_minute.map(|limit| {
            let now = Instant::now();
            let minute_count = self
                .minute_requests
                .iter()
                .filter(|t| now.duration_since(**t) < Duration::from_secs(60))
                .count();
            limit.saturating_sub(minute_count as u32)
        })
    }
}

/// Rate limiting manager
pub struct RateLimiter {
    limiters: Arc<RwLock<HashMap<ProviderType, ProviderRateLimiter>>>,
}

impl RateLimiter {
    pub fn new() -> Self {
        Self {
            limiters: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Configure rate limit for a provider
    pub async fn configure_provider(&self, provider: ProviderType, config: RateLimitConfig) {
        let mut limiters = self.limiters.write().await;
        limiters.insert(provider, ProviderRateLimiter::new(config));
    }

    /// Check if a request is allowed and record it
    pub async fn check_and_record(&self, provider: ProviderType) -> Result<()> {
        let mut limiters = self.limiters.write().await;
        if let Some(limiter) = limiters.get_mut(&provider) {
            limiter.check_and_record()
        } else {
            // If no limiter is configured for the provider, allow the request.
            Ok(())
        }
    }

    /// Get remaining requests for a provider
    pub async fn get_remaining(&self, provider: ProviderType) -> Option<u32> {
        let limiters = self.limiters.read().await;
        limiters.get(&provider).and_then(|l| l.get_remaining())
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rate_limit() {
        let limiter = RateLimiter::new();
        let provider = ProviderType::OpenAI;

        limiter
            .configure_provider(
                provider,
                RateLimitConfig {
                    requests_per_minute: 2,
                    requests_per_hour: 10,
                    requests_per_day: 100,
                },
            )
            .await;

        // First two requests should succeed
        assert!(limiter.check_and_record(provider).await.is_ok());
        assert!(limiter.check_and_record(provider).await.is_ok());

        // Third request should fail
        assert!(limiter.check_and_record(provider).await.is_err());
    }
}
