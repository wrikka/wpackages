//! Strategy pattern for model selection
//!
//! This module provides strategies for load balancing and cost optimization.

use crate::error::{AiModelsError, Result};
use crate::services::analytics::AnalyticsService;
use crate::services::registry::ModelRegistry;
use crate::types::traits::ChatModel;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

/// Strategy type for model selection
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StrategyType {
    RoundRobin,
    LeastLatency,
    LowestCost,
    Priority,
}

/// Strategy configuration
#[derive(Debug, Clone)]
pub struct StrategyConfig {
    pub strategy_type: StrategyType,
    pub weights: HashMap<String, f64>,
    pub priority_order: Vec<String>,
}

impl Default for StrategyConfig {
    fn default() -> Self {
        Self {
            strategy_type: StrategyType::RoundRobin,
            weights: HashMap::new(),
            priority_order: vec![],
        }
    }
}

impl StrategyConfig {
    pub fn new(strategy_type: StrategyType) -> Self {
        Self {
            strategy_type,
            ..Default::default()
        }
    }

    pub fn with_weight(mut self, provider: impl Into<String>, weight: f64) -> Self {
        self.weights.insert(provider.into(), weight);
        self
    }

    pub fn with_priority(mut self, providers: Vec<String>) -> Self {
        self.priority_order = providers;
        self
    }
}

/// Strategy manager for model selection
pub struct StrategyManager {
    config: StrategyConfig,
    registry: Arc<tokio::sync::RwLock<ModelRegistry>>,
    analytics: Arc<AnalyticsService>,
    round_robin_index: std::sync::atomic::AtomicUsize,
}

impl StrategyManager {
    pub fn new(
        config: StrategyConfig,
        registry: Arc<tokio::sync::RwLock<ModelRegistry>>,
        analytics: Arc<AnalyticsService>,
    ) -> Self {
        Self {
            config,
            registry,
            analytics,
            round_robin_index: std::sync::atomic::AtomicUsize::new(0),
        }
    }

    /// Select a provider based on the strategy
    pub async fn select_provider(
        &self,
        providers: &HashMap<String, Arc<dyn ChatModel>>,
    ) -> Result<Arc<dyn ChatModel>> {
        if providers.is_empty() {
            return Err(AiModelsError::InvalidInput(
                "No providers available".to_string(),
            ));
        }

        match self.config.strategy_type {
            StrategyType::RoundRobin => self.select_round_robin(providers).await,
            StrategyType::LeastLatency => self.select_least_latency(providers).await,
            StrategyType::LowestCost => self.select_lowest_cost(providers).await,
            StrategyType::Priority => self.select_priority(providers).await,
        }
    }

    async fn select_round_robin(
        &self,
        providers: &HashMap<String, Arc<dyn ChatModel>>,
    ) -> Result<Arc<dyn ChatModel>> {
        let keys: Vec<_> = providers.keys().cloned().collect();
        let index = self
            .round_robin_index
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed)
            % keys.len();

        providers
            .get(&keys[index])
            .cloned()
            .ok_or_else(|| AiModelsError::InvalidInput("Provider not found".to_string()))
    }

    async fn select_least_latency(
        &self,
        providers: &HashMap<String, Arc<dyn ChatModel>>,
    ) -> Result<Arc<dyn ChatModel>> {
        let logs = self.analytics.get_logs();
        let mut latencies: HashMap<String, (Duration, u32)> = HashMap::new();

        for log in logs {
            if !log.is_error {
                let entry = latencies.entry(log.provider).or_insert((Duration::new(0, 0), 0));
                entry.0 += log.latency;
                entry.1 += 1;
            }
        }

        let mut best_provider = None;
        let mut min_avg_latency = Duration::MAX;

        for (name, provider) in providers {
            let avg_latency = latencies
                .get(name)
                .map(|(total, count)| *total / *count)
                .unwrap_or(Duration::MAX);

            if avg_latency < min_avg_latency {
                min_avg_latency = avg_latency;
                best_provider = Some(provider.clone());
            }
        }

        best_provider.ok_or_else(|| AiModelsError::InvalidInput("No providers available".to_string()))
    }

    async fn select_lowest_cost(
        &self,
        providers: &HashMap<String, Arc<dyn ChatModel>>,
    ) -> Result<Arc<dyn ChatModel>> {
        let registry = self.registry.read().await;
        let capabilities = registry.list_capabilities().await;
        let mut best_provider = None;
        let mut min_cost = f64::MAX;

        for (name, provider) in providers {
            let provider_capabilities: Vec<_> = capabilities
                .iter()
                .filter(|c| c.provider.to_lowercase() == name.to_lowercase())
                .collect();

            if let Some(cap) = provider_capabilities.first() {
                // A simple cost metric: average of input and output costs.
                let cost = (cap.cost_per_million_input_tokens + cap.cost_per_million_output_tokens) as f64;
                if cost < min_cost {
                    min_cost = cost;
                    best_provider = Some(provider.clone());
                }
            }
        }

        best_provider.ok_or_else(|| AiModelsError::InvalidInput("No providers available".to_string()))
    }

    async fn select_priority(
        &self,
        providers: &HashMap<String, Arc<dyn ChatModel>>,
    ) -> Result<Arc<dyn ChatModel>> {
        for name in &self.config.priority_order {
            if let Some(provider) = providers.get(name) {
                return Ok(provider.clone());
            }
        }

        // Fallback to first available provider
        providers
            .values()
            .next()
            .cloned()
            .ok_or_else(|| AiModelsError::InvalidInput("No providers available".to_string()))
    }
}

impl Default for StrategyManager {
    fn default() -> Self {
        Self::new(StrategyConfig::default())
    }
}
