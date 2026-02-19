//! Budget management service
//!
//! This module manages budgets per user/project.

use crate::error::{AiModelsError, Result};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Budget configuration
#[derive(Debug, Clone)]
pub struct BudgetConfig {
    pub daily_limit: f64,
    pub monthly_limit: f64,
    pub alert_threshold: f64, // Alert when usage exceeds this percentage (0.0-1.0)
}

impl Default for BudgetConfig {
    fn default() -> Self {
        Self {
            daily_limit: 10.0,
            monthly_limit: 300.0,
            alert_threshold: 0.8,
        }
    }
}

/// Budget status
#[derive(Debug, Clone)]
pub struct BudgetStatus {
    pub entity_id: String,
    pub daily_used: f64,
    pub daily_limit: f64,
    pub daily_remaining: f64,
    pub daily_percentage: f64,
    pub monthly_used: f64,
    pub monthly_limit: f64,
    pub monthly_remaining: f64,
    pub monthly_percentage: f64,
    pub is_over_daily_limit: bool,
    pub is_over_monthly_limit: bool,
    pub should_alert: bool,
}

/// Budget usage record
#[derive(Debug, Clone)]
pub struct BudgetUsage {
    pub entity_id: String,
    pub amount: f64,
    pub timestamp: std::time::SystemTime,
}

/// Budget manager
pub struct BudgetManager {
    budgets: Arc<RwLock<HashMap<String, BudgetConfig>>>,
    daily_usage: Arc<RwLock<HashMap<String, f64>>>,
    monthly_usage: Arc<RwLock<HashMap<String, f64>>>,
    usage_records: Arc<RwLock<Vec<BudgetUsage>>>,
}

impl BudgetManager {
    pub fn new() -> Self {
        Self {
            budgets: Arc::new(RwLock::new(HashMap::new())),
            daily_usage: Arc::new(RwLock::new(HashMap::new())),
            monthly_usage: Arc::new(RwLock::new(HashMap::new())),
            usage_records: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Set budget for an entity (user/project)
    pub async fn set_budget(&self, entity_id: String, config: BudgetConfig) {
        let mut budgets = self.budgets.write().await;
        budgets.insert(entity_id, config);
    }

    /// Record usage for an entity
    pub async fn record_usage(&self, entity_id: String, amount: f64) -> Result<BudgetStatus> {
        // Check if budget exists
        let budgets = self.budgets.read().await;
        let _budget = budgets.get(&entity_id).ok_or_else(|| {
            AiModelsError::InvalidInput(format!("No budget configured for entity: {}", entity_id))
        })?;
        drop(budgets);

        // Update usage
        {
            let mut daily = self.daily_usage.write().await;
            *daily.entry(entity_id.clone()).or_insert(0.0) += amount;
        }

        {
            let mut monthly = self.monthly_usage.write().await;
            *monthly.entry(entity_id.clone()).or_insert(0.0) += amount;
        }

        // Record usage
        let record = BudgetUsage {
            entity_id: entity_id.clone(),
            amount,
            timestamp: std::time::SystemTime::now(),
        };
        let mut records = self.usage_records.write().await;
        records.push(record);

        // Get status
        self.get_status(entity_id).await
    }

    /// Get budget status for an entity
    pub async fn get_status(&self, entity_id: String) -> Result<BudgetStatus> {
        let budgets = self.budgets.read().await;
        let (daily_limit, monthly_limit, alert_threshold) = budgets
            .get(&entity_id)
            .map(|b| (b.daily_limit, b.monthly_limit, b.alert_threshold))
            .ok_or_else(|| {
                AiModelsError::InvalidInput(format!(
                    "No budget configured for entity: {}",
                    entity_id
                ))
            })?;
        drop(budgets);

        let daily = self.daily_usage.read().await;
        let daily_used = *daily.get(&entity_id).unwrap_or(&0.0);
        drop(daily);

        let monthly = self.monthly_usage.read().await;
        let monthly_used = *monthly.get(&entity_id).unwrap_or(&0.0);
        drop(monthly);

        let daily_remaining = (daily_limit - daily_used).max(0.0);
        let monthly_remaining = (monthly_limit - monthly_used).max(0.0);

        let daily_percentage = (daily_used / daily_limit).min(1.0);
        let monthly_percentage = (monthly_used / monthly_limit).min(1.0);

        let is_over_daily_limit = daily_used >= daily_limit;
        let is_over_monthly_limit = monthly_used >= monthly_limit;
        let should_alert =
            daily_percentage >= alert_threshold || monthly_percentage >= alert_threshold;

        Ok(BudgetStatus {
            entity_id,
            daily_used,
            daily_limit,
            daily_remaining,
            daily_percentage,
            monthly_used,
            monthly_limit,
            monthly_remaining,
            monthly_percentage,
            is_over_daily_limit,
            is_over_monthly_limit,
            should_alert,
        })
    }

    /// Check if a request is allowed within budget
    pub async fn check_allowed(&self, entity_id: String, estimated_cost: f64) -> Result<bool> {
        let status = self.get_status(entity_id).await?;

        if status.is_over_monthly_limit {
            return Ok(false);
        }

        if status.daily_remaining < estimated_cost {
            return Ok(false);
        }

        Ok(true)
    }

    /// Reset daily usage (call this daily)
    pub async fn reset_daily_usage(&self) {
        let mut daily = self.daily_usage.write().await;
        daily.clear();
    }

    /// Reset monthly usage (call this monthly)
    pub async fn reset_monthly_usage(&self) {
        let mut monthly = self.monthly_usage.write().await;
        monthly.clear();
    }

    /// Get all budget statuses
    pub async fn get_all_statuses(&self) -> Vec<BudgetStatus> {
        let budgets = self.budgets.read().await;
        let mut statuses = Vec::new();

        for entity_id in budgets.keys() {
            if let Ok(status) = self.get_status(entity_id.clone()).await {
                statuses.push(status);
            }
        }

        statuses
    }

    /// Get usage records for an entity
    pub async fn get_usage_records(&self, entity_id: &str) -> Vec<BudgetUsage> {
        let records = self.usage_records.read().await;
        records
            .iter()
            .filter(|r| r.entity_id == entity_id)
            .cloned()
            .collect()
    }

    /// Clear all data
    pub async fn clear(&self) {
        let mut budgets = self.budgets.write().await;
        budgets.clear();

        let mut daily = self.daily_usage.write().await;
        daily.clear();

        let mut monthly = self.monthly_usage.write().await;
        monthly.clear();

        let mut records = self.usage_records.write().await;
        records.clear();
    }
}

impl Default for BudgetManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_budget_management() {
        let manager = BudgetManager::new();

        let config = BudgetConfig {
            daily_limit: 10.0,
            monthly_limit: 100.0,
            alert_threshold: 0.8,
        };

        manager.set_budget("user-123".to_string(), config).await;

        // Record some usage
        manager
            .record_usage("user-123".to_string(), 5.0)
            .await
            .unwrap();

        let status = manager.get_status("user-123".to_string()).await.unwrap();
        assert_eq!(status.daily_used, 5.0);
        assert_eq!(status.daily_remaining, 5.0);
        assert!(!status.is_over_daily_limit);

        // Check if allowed
        assert!(manager
            .check_allowed("user-123".to_string(), 4.0)
            .await
            .unwrap());
        assert!(!manager
            .check_allowed("user-123".to_string(), 6.0)
            .await
            .unwrap());
    }
}
