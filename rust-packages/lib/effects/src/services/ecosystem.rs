//! # Effect Ecosystem
//!
//! Ecosystem รอบๆ effect library.
//!
//! ## Features
//!
//! - **Effect integrations** - Integrate with external systems
//! - **Effect adapters** - Adapt external libraries to effect system
//! - **Effect utilities** - Utility functions for effects
//! - **Effect patterns** - Common patterns for effect usage
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, EffectEcosystem};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     // Use effect patterns
//!     let effect = EffectEcosystem::resilient_operation(|_| {
//!         Effect::success(42)
//!     });
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

use std::collections::HashMap;

/// Effect ecosystem for managing effect-related integrations and patterns
#[derive(Debug, Clone)]
pub struct EffectEcosystem {
    /// Effect patterns
    patterns: HashMap<String, EffectPattern>,
    /// Effect integrations
    integrations: HashMap<String, String>,
    /// Effect adapters
    adapters: HashMap<String, String>,
}

impl Default for EffectEcosystem {
    fn default() -> Self {
        let mut ecosystem = Self {
            patterns: HashMap::new(),
            integrations: HashMap::new(),
            adapters: HashMap::new(),
        };

        // Add default patterns
        ecosystem.add_pattern("resilient_operation".to_string(), EffectPattern::ResilientOperation);
        ecosystem.add_pattern("async_operation".to_string(), EffectPattern::AsyncOperation);
        ecosystem.add_pattern("parallel_execution".to_string(), EffectPattern::ParallelExecution);
        ecosystem.add_pattern("resource_management".to_string(), EffectPattern::ResourceManagement);

        ecosystem
    }
}

impl EffectEcosystem {
    /// Create new effect ecosystem
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a pattern to the ecosystem
    pub fn add_pattern(&mut self, name: String, pattern: EffectPattern) {
        self.patterns.insert(name, pattern);
    }

    /// Get a pattern from the ecosystem
    pub fn get_pattern(&self, name: &str) -> Option<&EffectPattern> {
        self.patterns.get(name)
    }

    /// Add an integration to the ecosystem
    pub fn add_integration(&mut self, name: String, integration: String) {
        self.integrations.insert(name, integration);
    }

    /// Get an integration from the ecosystem
    pub fn get_integration(&self, name: &str) -> Option<&String> {
        self.integrations.get(name)
    }

    /// Add an adapter to the ecosystem
    pub fn add_adapter(&mut self, name: String, adapter: String) {
        self.adapters.insert(name, adapter);
    }

    /// Get an adapter from the ecosystem
    pub fn get_adapter(&self, name: &str) -> Option<&String> {
        self.adapters.get(name)
    }
}

/// Effect patterns for common use cases
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EffectPattern {
    /// Resilient operation pattern
    ResilientOperation,
    /// Async operation pattern
    AsyncOperation,
    /// Parallel execution pattern
    ParallelExecution,
    /// Resource management pattern
    ResourceManagement,
    /// Retry pattern
    Retry,
    /// Circuit breaker pattern
    CircuitBreaker,
    /// Rate limiting pattern
    RateLimiting,
    /// Throttling pattern
    Throttling,
}

/// Effect pattern configuration
#[derive(Debug, Clone)]
pub struct EffectPatternConfig {
    /// Whether to enable retry
    pub retry_enabled: bool,
    /// Whether to enable circuit breaker
    pub circuit_breaker_enabled: bool,
    /// Whether to enable rate limiting
    pub rate_limiting_enabled: bool,
    /// Whether to enable throttling
    pub throttling_enabled: bool,
}

impl Default for EffectPatternConfig {
    fn default() -> Self {
        Self {
            retry_enabled: false,
            circuit_breaker_enabled: false,
            rate_limiting_enabled: false,
            throttling_enabled: false,
        }
    }
}

impl EffectPatternConfig {
    /// Create new pattern config
    pub fn new() -> Self {
        Self::default()
    }

    /// Enable retry in the pattern
    pub fn with_retry(mut self, enabled: bool) -> Self {
        self.retry_enabled = enabled;
        self
    }

    /// Enable circuit breaker in the pattern
    pub fn with_circuit_breaker(mut self, enabled: bool) -> Self {
        self.circuit_breaker_enabled = enabled;
        self
    }

    /// Enable rate limiting in the pattern
    pub fn with_rate_limiting(mut self, enabled: bool) -> Self {
        self.rate_limiting_enabled = enabled;
        self
    }

    /// Enable throttling in the pattern
    pub fn with_throttling(mut self, enabled: bool) -> Self {
        self.throttling_enabled = enabled;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_effect_ecosystem_default() {
        let ecosystem = EffectEcosystem::new();

        assert!(ecosystem.get_pattern("resilient_operation").is_some());
        assert!(ecosystem.get_pattern("async_operation").is_some());
        assert!(ecosystem.get_pattern("parallel_execution").is_some());
        assert!(ecosystem.get_pattern("resource_management").is_some());
    }

    #[test]
    fn test_effect_pattern_config() {
        let config = EffectPatternConfig::new()
            .with_retry(true)
            .with_circuit_breaker(true)
            .with_rate_limiting(true)
            .with_throttling(true);

        assert!(config.retry_enabled);
        assert!(config.circuit_breaker_enabled);
        assert!(config.rate_limiting_enabled);
        assert!(config.throttling_enabled);
    }
}
