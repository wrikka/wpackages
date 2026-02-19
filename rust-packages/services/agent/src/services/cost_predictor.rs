//! services/cost_predictor.rs

use crate::types::budget::CostType;
use crate::types::plan::HierarchicalPlan;
use crate::types::prediction::CostPrediction;
use std::collections::HashMap;

/// A service that predicts the resource cost of a plan.
#[derive(Clone, Default)]
pub struct CostPredictor;

impl CostPredictor {
    pub fn new() -> Self {
        Self::default()
    }

    /// Estimates the cost of executing a hierarchical plan.
    /// This is a simplified implementation.
    pub async fn predict_cost(&self, plan: &HierarchicalPlan) -> CostPrediction {
        let mut costs = HashMap::new();
        // Assume each task in the plan costs 100 LLM tokens.
        let token_cost = (plan.tasks.len() as u64) * 100;
        costs.insert(CostType::LlmTokens, token_cost);
        CostPrediction { costs }
    }
}
