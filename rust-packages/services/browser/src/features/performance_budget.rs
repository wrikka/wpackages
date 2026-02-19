use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceBudget {
    pub name: String,
    pub thresholds: HashMap<String, BudgetThreshold>,
    pub enabled: bool,
    pub strict_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetThreshold {
    pub metric: String,
    pub max_value: f64,
    pub warning_value: f64,
    pub unit: MetricUnit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MetricUnit {
    Milliseconds,
    Bytes,
    Kilobytes,
    Megabytes,
    Count,
    Percentage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetResult {
    pub metric: String,
    pub actual_value: f64,
    pub threshold_value: f64,
    pub status: BudgetStatus,
    pub over_budget_by: f64,
    pub over_budget_percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BudgetStatus {
    Pass,
    Warning,
    Fail,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetReport {
    pub budget_name: String,
    pub timestamp: i64,
    pub results: Vec<BudgetResult>,
    pub overall_status: BudgetStatus,
    pub violations: Vec<String>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct PerformanceBudgetMonitor {
    budgets: HashMap<String, PerformanceBudget>,
    alerts: Vec<BudgetAlert>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetAlert {
    pub budget_name: String,
    pub metric: String,
    pub severity: AlertSeverity,
    pub message: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
}

impl PerformanceBudgetMonitor {
    pub fn new() -> Self {
        Self {
            budgets: HashMap::new(),
            alerts: Vec::new(),
        }
    }

    pub fn add_budget(&mut self, budget: PerformanceBudget) {
        self.budgets.insert(budget.name.clone(), budget);
    }

    pub fn create_default_web_budget(name: &str) -> PerformanceBudget {
        let mut thresholds = HashMap::new();

        thresholds.insert("load_time".to_string(), BudgetThreshold {
            metric: "load_time".to_string(),
            max_value: 3000.0,
            warning_value: 2000.0,
            unit: MetricUnit::Milliseconds,
        });

        thresholds.insert("first_contentful_paint".to_string(), BudgetThreshold {
            metric: "first_contentful_paint".to_string(),
            max_value: 1800.0,
            warning_value: 1200.0,
            unit: MetricUnit::Milliseconds,
        });

        thresholds.insert("total_transfer_size".to_string(), BudgetThreshold {
            metric: "total_transfer_size".to_string(),
            max_value: 5.0,
            warning_value: 3.0,
            unit: MetricUnit::Megabytes,
        });

        thresholds.insert("request_count".to_string(), BudgetThreshold {
            metric: "request_count".to_string(),
            max_value: 100.0,
            warning_value: 70.0,
            unit: MetricUnit::Count,
        });

        thresholds.insert("javascript_size".to_string(), BudgetThreshold {
            metric: "javascript_size".to_string(),
            max_value: 1.0,
            warning_value: 0.5,
            unit: MetricUnit::Megabytes,
        });

        thresholds.insert("image_size".to_string(), BudgetThreshold {
            metric: "image_size".to_string(),
            max_value: 2.0,
            warning_value: 1.0,
            unit: MetricUnit::Megabytes,
        });

        PerformanceBudget {
            name: name.to_string(),
            thresholds,
            enabled: true,
            strict_mode: false,
        }
    }

    pub fn check_budget(&mut self, budget_name: &str, metrics: &HashMap<String, f64>) -> BudgetReport {
        let budget = match self.budgets.get(budget_name) {
            Some(b) if b.enabled => b,
            _ => return BudgetReport {
                budget_name: budget_name.to_string(),
                timestamp: chrono::Utc::now().timestamp(),
                results: Vec::new(),
                overall_status: BudgetStatus::Pass,
                violations: vec![format!("Budget '{}' not found or disabled", budget_name)],
                recommendations: Vec::new(),
            },
        };

        let mut results = Vec::new();
        let mut violations = Vec::new();
        let mut recommendations = Vec::new();
        let mut has_failures = false;
        let mut has_warnings = false;

        for (metric_name, threshold) in &budget.thresholds {
            if let Some(&actual_value) = metrics.get(metric_name) {
                let (status, over_by, over_pct) = if actual_value > threshold.max_value {
                    has_failures = true;
                    (BudgetStatus::Fail, actual_value - threshold.max_value, 
                        ((actual_value - threshold.max_value) / threshold.max_value) * 100.0)
                } else if actual_value > threshold.warning_value {
                    has_warnings = true;
                    (BudgetStatus::Warning, actual_value - threshold.warning_value,
                        ((actual_value - threshold.warning_value) / threshold.warning_value) * 100.0)
                } else {
                    (BudgetStatus::Pass, 0.0, 0.0)
                };

                results.push(BudgetResult {
                    metric: metric_name.clone(),
                    actual_value,
                    threshold_value: threshold.max_value,
                    status: status.clone(),
                    over_budget_by: over_by,
                    over_budget_percentage: over_pct,
                });

                match status {
                    BudgetStatus::Fail => {
                        let msg = format!("{} exceeded by {:.2} {:?} ({:.1}% over)", 
                            metric_name, over_by, threshold.unit, over_pct);
                        violations.push(msg.clone());
                        
                        if let Some(rec) = self.generate_recommendation(metric_name, actual_value, threshold) {
                            recommendations.push(rec);
                        }

                        self.alerts.push(BudgetAlert {
                            budget_name: budget_name.to_string(),
                            metric: metric_name.clone(),
                            severity: AlertSeverity::Critical,
                            message: msg,
                            timestamp: chrono::Utc::now().timestamp(),
                        });
                    }
                    BudgetStatus::Warning => {
                        let msg = format!("{} is within warning threshold: {:.2} {:?}", 
                            metric_name, actual_value, threshold.unit);
                        
                        self.alerts.push(BudgetAlert {
                            budget_name: budget_name.to_string(),
                            metric: metric_name.clone(),
                            severity: AlertSeverity::Warning,
                            message: msg,
                            timestamp: chrono::Utc::now().timestamp(),
                        });
                    }
                    _ => {}
                }
            }
        }

        let overall_status = if has_failures {
            BudgetStatus::Fail
        } else if has_warnings {
            BudgetStatus::Warning
        } else {
            BudgetStatus::Pass
        };

        BudgetReport {
            budget_name: budget_name.to_string(),
            timestamp: chrono::Utc::now().timestamp(),
            results,
            overall_status,
            violations,
            recommendations,
        }
    }

    fn generate_recommendation(&self, metric: &str, value: f64, threshold: &BudgetThreshold) -> Option<String> {
        match metric {
            "load_time" | "first_contentful_paint" => {
                Some(format!(
                    "Consider: 1) Implement lazy loading for images, \
                    2) Minimize render-blocking resources, \
                    3) Enable compression, \
                    4) Use CDN for static assets. Current: {:.0}ms, Target: <{:.0}ms",
                    value, threshold.max_value
                ))
            }
            "total_transfer_size" | "javascript_size" | "image_size" => {
                Some(format!(
                    "Consider: 1) Enable gzip/brotli compression, \
                    2) Optimize images (WebP, lazy loading), \
                    3) Tree-shake unused code, \
                    4) Code splitting. Current: {:.2}MB, Target: <{:.2}MB",
                    value, threshold.max_value
                ))
            }
            "request_count" => {
                Some(format!(
                    "Consider: 1) Combine CSS/JS files, \
                    2) Use HTTP/2 server push, \
                    3) Sprite sheets for icons, \
                    4) Cache assets. Current: {:.0} requests, Target: <{:.0}",
                    value, threshold.max_value
                ))
            }
            _ => None,
        }
    }

    pub fn get_alerts(&self, budget_name: Option<&str>, severity: Option<AlertSeverity>) -> Vec<&BudgetAlert> {
        self.alerts.iter()
            .filter(|a| budget_name.map(|bn| bn == a.budget_name).unwrap_or(true))
            .filter(|a| severity.as_ref().map(|s| std::mem::discriminant(s) == std::mem::discriminant(&a.severity)).unwrap_or(true))
            .collect()
    }

    pub fn clear_alerts(&mut self) {
        self.alerts.clear();
    }

    pub fn export_report_json(&self, report: &BudgetReport) -> String {
        serde_json::to_string_pretty(report).unwrap_or_default()
    }
}
