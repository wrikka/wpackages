//! Cost tracking service
//! 
//! This module tracks costs per request using the ModelCapabilityRegistry.

use crate::error::Result;
use crate::services::registry::ModelRegistry;
use crate::types::{ChatResponse, ProviderType};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Cost tracking manager
#[derive(Clone)]
pub struct CostTracker {
    registry: Arc<RwLock<ModelRegistry>>,
}

impl CostTracker {
    /// Create a new `CostTracker` with a reference to the `ModelRegistry`.
    pub fn new(registry: Arc<RwLock<ModelRegistry>>) -> Self {
        Self { registry }
    }

    /// Calculate the cost of a chat response based on model capabilities.
    pub async fn calculate_cost(&self, response: &ChatResponse) -> Result<f64> {
        let registry = self.registry.read().await;
        let capability = registry.get_capability(&response.model).await;

        if let Some(cap) = capability {
            let input_cost = (response.usage.prompt_tokens as f64 / 1_000_000.0)
                * (cap.cost_per_million_input_tokens as f64 / 100.0);
            let output_cost = (response.usage.completion_tokens as f64 / 1_000_000.0)
                * (cap.cost_per_million_output_tokens as f64 / 100.0);
            Ok(input_cost + output_cost)
        } else {
            // If no capability is found, we cannot determine the cost.
            Ok(0.0)
        }
    }
}

