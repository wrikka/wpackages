//! Cost Tracking Dashboard
//!
//! Track API costs for AI-powered actions.

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Cost tracking manager
pub struct CostTracker {
    records: Arc<Mutex<Vec<CostRecord>>>,
    budgets: Arc<Mutex<HashMap<String, Budget>>>,
    providers: Arc<Mutex<HashMap<String, ProviderConfig>>>,
    daily_totals: Arc<Mutex<HashMap<String, f64>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostRecord {
    pub id: String,
    pub timestamp: u64,
    pub provider: String,
    pub model: String,
    pub action: String,
    pub input_tokens: usize,
    pub output_tokens: usize,
    pub cost_usd: f64,
    pub workflow_id: Option<String>,
    pub session_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Budget {
    pub id: String,
    pub name: String,
    pub limit_usd: f64,
    pub period: BudgetPeriod,
    pub current_spent: f64,
    pub alert_threshold: f64, // 0.0-1.0
    pub alert_sent: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum BudgetPeriod {
    Daily,
    Weekly,
    Monthly,
    Yearly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub name: String,
    pub input_cost_per_1k: f64,  // USD per 1K tokens
    pub output_cost_per_1k: f64, // USD per 1K tokens
    pub image_cost_per_1k: f64, // For vision models
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostDashboard {
    pub total_cost_today: f64,
    pub total_cost_this_month: f64,
    pub total_cost_all_time: f64,
    pub cost_by_provider: HashMap<String, f64>,
    pub cost_by_model: HashMap<String, f64>,
    pub cost_by_action: HashMap<String, f64>,
    pub recent_records: Vec<CostRecord>,
    pub budget_status: Vec<BudgetStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetStatus {
    pub budget_id: String,
    pub budget_name: String,
    pub limit: f64,
    pub spent: f64,
    pub remaining: f64,
    pub percentage_used: f64,
    pub is_exceeded: bool,
    pub is_near_limit: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostReport {
    pub start_date: u64,
    pub end_date: u64,
    pub total_cost: f64,
    pub total_requests: usize,
    pub average_cost_per_request: f64,
    pub cost_by_day: HashMap<String, f64>,
    pub top_expensive_operations: Vec<(String, f64)>,
}

impl CostTracker {
    pub fn new() -> Self {
        let mut providers = HashMap::new();
        
        // Default provider configs
        providers.insert("anthropic".to_string(), ProviderConfig {
            name: "Anthropic".to_string(),
            input_cost_per_1k: 3.0,
            output_cost_per_1k: 15.0,
            image_cost_per_1k: 0.0,
            enabled: true,
        });
        
        providers.insert("openai".to_string(), ProviderConfig {
            name: "OpenAI".to_string(),
            input_cost_per_1k: 2.5,
            output_cost_per_1k: 10.0,
            image_cost_per_1k: 0.0,
            enabled: true,
        });
        
        providers.insert("local".to_string(), ProviderConfig {
            name: "Local Model".to_string(),
            input_cost_per_1k: 0.0,
            output_cost_per_1k: 0.0,
            image_cost_per_1k: 0.0,
            enabled: true,
        });

        Self {
            records: Arc::new(Mutex::new(vec![])),
            budgets: Arc::new(Mutex::new(HashMap::new())),
            providers: Arc::new(Mutex::new(providers)),
            daily_totals: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Record a cost
    pub async fn record_cost(
        &self,
        provider: &str,
        model: &str,
        action: &str,
        input_tokens: usize,
        output_tokens: usize,
        workflow_id: Option<&str>,
        session_id: &str,
    ) -> CostRecord {
        let provider_config = self.providers.lock().await.get(provider).cloned();
        
        let cost = if let Some(config) = provider_config {
            let input_cost = (input_tokens as f64 / 1000.0) * config.input_cost_per_1k;
            let output_cost = (output_tokens as f64 / 1000.0) * config.output_cost_per_1k;
            input_cost + output_cost
        } else {
            0.0
        };

        let record = CostRecord {
            id: uuid::Uuid::new_uuid().to_string(),
            timestamp: current_timestamp(),
            provider: provider.to_string(),
            model: model.to_string(),
            action: action.to_string(),
            input_tokens,
            output_tokens,
            cost_usd: cost,
            workflow_id: workflow_id.map(|s| s.to_string()),
            session_id: session_id.to_string(),
        };

        self.records.lock().await.push(record.clone());
        
        // Update daily total
        let date = chrono::Local::now().format("%Y-%m-%d").to_string();
        let mut daily_totals = self.daily_totals.lock().await;
        *daily_totals.entry(date).or_insert(0.0) += cost;

        record
    }

    /// Create budget
    pub async fn create_budget(&self, name: &str, limit: f64, period: BudgetPeriod) -> String {
        let id = uuid::Uuid::new_uuid().to_string();
        let budget = Budget {
            id: id.clone(),
            name: name.to_string(),
            limit_usd: limit,
            period,
            current_spent: 0.0,
            alert_threshold: 0.8,
            alert_sent: false,
        };
        self.budgets.lock().await.insert(id.clone(), budget);
        id
    }

    /// Get dashboard data
    pub async fn get_dashboard(&self) -> CostDashboard {
        let records = self.records.lock().await;
        let budgets = self.budgets.lock().await;
        let daily_totals = self.daily_totals.lock().await;
        
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();
        let total_today = *daily_totals.get(&today).unwrap_or(&0.0);
        
        // Calculate month total
        let current_month = chrono::Local::now().format("%Y-%m").to_string();
        let total_month: f64 = daily_totals
            .iter()
            .filter(|(date, _)| date.starts_with(&current_month))
            .map(|(_, cost)| cost)
            .sum();
        
        // Calculate all time
        let total_all: f64 = records.iter().map(|r| r.cost_usd).sum();
        
        // Group by provider
        let mut by_provider: HashMap<String, f64> = HashMap::new();
        let mut by_model: HashMap<String, f64> = HashMap::new();
        let mut by_action: HashMap<String, f64> = HashMap::new();
        
        for record in records.iter() {
            *by_provider.entry(record.provider.clone()).or_insert(0.0) += record.cost_usd;
            *by_model.entry(record.model.clone()).or_insert(0.0) += record.cost_usd;
            *by_action.entry(record.action.clone()).or_insert(0.0) += record.cost_usd;
        }
        
        // Budget status
        let mut budget_status = vec![];
        for budget in budgets.values() {
            let spent = budget.current_spent;
            let percentage = if budget.limit_usd > 0.0 { spent / budget.limit_usd } else { 0.0 };
            budget_status.push(BudgetStatus {
                budget_id: budget.id.clone(),
                budget_name: budget.name.clone(),
                limit: budget.limit_usd,
                spent,
                remaining: budget.limit_usd - spent,
                percentage_used: percentage * 100.0,
                is_exceeded: spent >= budget.limit_usd,
                is_near_limit: percentage >= budget.alert_threshold,
            });
        }
        
        CostDashboard {
            total_cost_today: total_today,
            total_cost_this_month: total_month,
            total_cost_all_time: total_all,
            cost_by_provider: by_provider,
            cost_by_model: by_model,
            cost_by_action: by_action,
            recent_records: records.iter().rev().take(50).cloned().collect(),
            budget_status,
        }
    }

    /// Generate report for date range
    pub async fn generate_report(&self, start: u64, end: u64) -> CostReport {
        let records: Vec<_> = self.records
            .lock()
            .await
            .iter()
            .filter(|r| r.timestamp >= start && r.timestamp <= end)
            .cloned()
            .collect();
        
        let total_cost: f64 = records.iter().map(|r| r.cost_usd).sum();
        let total_requests = records.len();
        let avg_cost = if total_requests > 0 { total_cost / total_requests as f64 } else { 0.0 };
        
        // Cost by day
        let mut by_day: HashMap<String, f64> = HashMap::new();
        for record in &records {
            let date = chrono::DateTime::from_timestamp(record.timestamp as i64, 0)
                .map(|dt| dt.format("%Y-%m-%d").to_string())
                .unwrap_or_default();
            *by_day.entry(date).or_insert(0.0) += record.cost_usd;
        }
        
        // Top expensive operations
        let mut by_action: HashMap<String, f64> = HashMap::new();
        for record in &records {
            *by_action.entry(record.action.clone()).or_insert(0.0) += record.cost_usd;
        }
        let mut top_ops: Vec<_> = by_action.into_iter().collect();
        top_ops.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        top_ops.truncate(10);
        
        CostReport {
            start_date: start,
            end_date: end,
            total_cost,
            total_requests,
            average_cost_per_request: avg_cost,
            cost_by_day: by_day,
            top_expensive_operations: top_ops,
        }
    }

    /// Check budget alerts
    pub async fn check_budgets(&self) -> Vec<BudgetAlert> {
        let budgets = self.budgets.lock().await;
        let mut alerts = vec![];
        
        for budget in budgets.values() {
            let percentage = if budget.limit_usd > 0.0 { budget.current_spent / budget.limit_usd } else { 0.0 };
            
            if budget.current_spent >= budget.limit_usd {
                alerts.push(BudgetAlert {
                    budget_id: budget.id.clone(),
                    budget_name: budget.name.clone(),
                    alert_type: AlertType::Exceeded,
                    message: format!("Budget '{}' exceeded! Spent: ${:.2}, Limit: ${:.2}", budget.name, budget.current_spent, budget.limit_usd),
                });
            } else if percentage >= budget.alert_threshold && !budget.alert_sent {
                alerts.push(BudgetAlert {
                    budget_id: budget.id.clone(),
                    budget_name: budget.name.clone(),
                    alert_type: AlertType::NearLimit,
                    message: format!("Budget '{}' at {:.0}% of limit", budget.name, percentage * 100.0),
                });
            }
        }
        
        alerts
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetAlert {
    pub budget_id: String,
    pub budget_name: String,
    pub alert_type: AlertType,
    pub message: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum AlertType {
    NearLimit,
    Exceeded,
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

use chrono::TimeZone;
