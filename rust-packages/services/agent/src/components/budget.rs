//! components/budget.rs

use crate::types::budget::{Budget, CostRecord, CostType};
use crate::types::prediction::CostPrediction;
use crate::types::traits::BudgetManager;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// A default, in-memory implementation of the `BudgetManager` trait.
#[derive(Clone)]
pub struct DefaultBudgetManager {
    limits: Arc<HashMap<CostType, u64>>,
    usage: Arc<Mutex<HashMap<CostType, u64>>>,
}

impl DefaultBudgetManager {
    /// Creates a new `DefaultBudgetManager` with the given budget.
    pub fn new(budget: Budget) -> Self {
        Self {
            limits: Arc::new(budget.limits),
            usage: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl BudgetManager for DefaultBudgetManager {
    /// Records a cost and updates the current usage.
    async fn record_cost(&self, record: CostRecord) {
        let mut usage = self.usage.lock().unwrap();
        let current_usage = usage.entry(record.cost_type).or_insert(0);
        *current_usage += record.amount;
    }

    /// Checks if any cost type has exceeded its defined limit.
    async fn check_predicted_cost(&self, prediction: &CostPrediction) -> bool {
        let usage = self.usage.lock().unwrap();
        for (cost_type, predicted_amount) in &prediction.costs {
            if let Some(limit) = self.limits.get(cost_type) {
                let current_usage = usage.get(cost_type).unwrap_or(&0);
                if current_usage + predicted_amount > *limit {
                    return true; // Exceeds budget
                }
            }
        }
        false // Within budget
    }

    async fn is_exceeded(&self) -> bool {
        let usage = self.usage.lock().unwrap();
        for (cost_type, limit) in self.limits.iter() {
            if let Some(current_usage) = usage.get(cost_type) {
                if current_usage > limit {
                    return true;
                }
            }
        }
        false
    }
}
