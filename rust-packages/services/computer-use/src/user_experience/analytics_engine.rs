//! Performance Analytics (Feature 12)
//!
//! Dashboard showing success rate, execution time, and bottlenecks

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

/// Performance metrics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PerformanceMetrics {
    pub total_executions: u64,
    pub successful_executions: u64,
    pub failed_executions: u64,
    pub total_duration: Duration,
    pub average_duration: Duration,
    pub min_duration: Option<Duration>,
    pub max_duration: Option<Duration>,
    pub success_rate: f32,
}

/// Workflow-specific metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowMetrics {
    pub workflow_id: String,
    pub name: String,
    pub metrics: PerformanceMetrics,
    pub step_metrics: Vec<StepMetric>,
    pub error_breakdown: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepMetric {
    pub step_index: usize,
    pub action_type: String,
    pub average_duration: Duration,
    pub failure_count: u32,
    pub bottleneck_score: f32,
}

/// System-wide performance data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemAnalytics {
    pub overall: PerformanceMetrics,
    pub workflow_metrics: Vec<WorkflowMetrics>,
    pub hourly_distribution: Vec<HourlyStat>,
    pub resource_usage: ResourceUsage,
    pub trends: Trends,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HourlyStat {
    pub hour: u8,
    pub executions: u64,
    pub avg_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResourceUsage {
    pub cpu_percent: f32,
    pub memory_mb: u64,
    pub disk_io_mb: f64,
    pub network_io_mb: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Trends {
    pub daily_success_rate: Vec<DataPoint>,
    pub weekly_executions: Vec<DataPoint>,
    pub monthly_failures: Vec<DataPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataPoint {
    pub timestamp: u64,
    pub value: f32,
}

/// Analytics engine
pub struct AnalyticsEngine {
    execution_history: Vec<ExecutionRecord>,
    workflow_data: HashMap<String, WorkflowMetrics>,
    daily_stats: HashMap<String, DailyStats>,
}

#[derive(Debug, Clone)]
struct ExecutionRecord {
    workflow_id: String,
    started_at: u64,
    completed_at: u64,
    success: bool,
    error: Option<String>,
    step_count: usize,
    steps: Vec<StepRecord>,
}

#[derive(Debug, Clone)]
struct StepRecord {
    action_type: String,
    duration_ms: u64,
    success: bool,
}

#[derive(Debug, Clone, Default)]
struct DailyStats {
    date: String,
    executions: u64,
    successes: u64,
    failures: u64,
    total_duration_ms: u64,
}

impl AnalyticsEngine {
    pub fn new() -> Self {
        Self {
            execution_history: Vec::new(),
            workflow_data: HashMap::new(),
            daily_stats: HashMap::new(),
        }
    }

    /// Record execution start
    pub fn record_start(&mut self, workflow_id: &str) -> String {
        let record = ExecutionRecord {
            workflow_id: workflow_id.to_string(),
            started_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            completed_at: 0,
            success: false,
            error: None,
            step_count: 0,
            steps: Vec::new(),
        };

        self.execution_history.push(record);
        workflow_id.to_string()
    }

    /// Record execution completion
    pub fn record_completion(&mut self, workflow_id: &str, success: bool, error: Option<&str>) {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        if let Some(record) = self.execution_history.iter_mut().rev().find(|r| r.workflow_id == workflow_id && r.completed_at == 0) {
            record.completed_at = now;
            record.success = success;
            record.error = error.map(String::from);
        }

        // Update workflow metrics
        self.update_workflow_metrics(workflow_id);

        // Update daily stats
        self.update_daily_stats(success, now - self.execution_history.last().map(|r| r.started_at).unwrap_or(now));
    }

    /// Record step execution
    pub fn record_step(&mut self, workflow_id: &str, action_type: &str, duration: Duration, success: bool) {
        if let Some(record) = self.execution_history.iter_mut().rev().find(|r| r.workflow_id == workflow_id && r.completed_at == 0) {
            record.steps.push(StepRecord {
                action_type: action_type.to_string(),
                duration_ms: duration.as_millis() as u64,
                success,
            });
            record.step_count += 1;
        }
    }

    /// Get overall system analytics
    pub fn get_analytics(&self) -> SystemAnalytics {
        let overall = self.calculate_overall_metrics();
        let workflow_metrics: Vec<WorkflowMetrics> = self.workflow_data.values().cloned().collect();
        let hourly_distribution = self.calculate_hourly_distribution();
        let trends = self.calculate_trends();

        SystemAnalytics {
            overall,
            workflow_metrics,
            hourly_distribution,
            resource_usage: ResourceUsage::default(),
            trends,
        }
    }

    /// Get analytics for specific workflow
    pub fn get_workflow_analytics(&self, workflow_id: &str) -> Option<&WorkflowMetrics> {
        self.workflow_data.get(workflow_id)
    }

    /// Get success rate over time
    pub fn get_success_rate_trend(&self, days: u32) -> Vec<DataPoint> {
        let mut trend = Vec::new();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        for day in 0..days {
            let date = now - (day as u64 * 86400);
            let date_str = self.timestamp_to_date(date);

            if let Some(stats) = self.daily_stats.get(&date_str) {
                let rate = if stats.executions > 0 {
                    stats.successes as f32 / stats.executions as f32
                } else {
                    0.0
                };

                trend.push(DataPoint {
                    timestamp: date,
                    value: rate,
                });
            }
        }

        trend.reverse();
        trend
    }

    /// Identify bottlenecks
    pub fn identify_bottlenecks(&self, threshold_ms: u64) -> Vec<WorkflowBottleneck> {
        let mut bottlenecks = Vec::new();

        for workflow in self.workflow_data.values() {
            for step in &workflow.step_metrics {
                if step.average_duration.as_millis() as u64 > threshold_ms {
                    bottlenecks.push(WorkflowBottleneck {
                        workflow_id: workflow.workflow_id.clone(),
                        workflow_name: workflow.name.clone(),
                        step_index: step.step_index,
                        action_type: step.action_type.clone(),
                        avg_duration: step.average_duration,
                        bottleneck_score: step.bottleneck_score,
                    });
                }
            }
        }

        // Sort by bottleneck score
        bottlenecks.sort_by(|a, b| b.bottleneck_score.partial_cmp(&a.bottleneck_score).unwrap());
        bottlenecks
    }

    /// Generate performance report
    pub fn generate_report(&self) -> Result<String> {
        let analytics = self.get_analytics();

        let mut report = String::new();
        report.push_str("# Performance Report\n\n");

        // Overall metrics
        report.push_str("## Overall Metrics\n\n");
        report.push_str(&format!("- Total Executions: {}\n", analytics.overall.total_executions));
        report.push_str(&format!("- Success Rate: {:.1}%\n", analytics.overall.success_rate * 100.0));
        report.push_str(&format!("- Average Duration: {:?}\n", analytics.overall.average_duration));
        report.push_str(&format!("- Failed Executions: {}\n\n", analytics.overall.failed_executions));

        // Top workflows
        report.push_str("## Top Workflows\n\n");
        let mut workflows = analytics.workflow_metrics.clone();
        workflows.sort_by(|a, b| b.metrics.total_executions.cmp(&a.metrics.total_executions));

        for (i, workflow) in workflows.iter().take(10).enumerate() {
            report.push_str(&format!(
                "{}. {} - {} executions ({:.1}% success)\n",
                i + 1,
                workflow.name,
                workflow.metrics.total_executions,
                workflow.metrics.success_rate * 100.0
            ));
        }

        // Bottlenecks
        let bottlenecks = self.identify_bottlenecks(5000);
        if !bottlenecks.is_empty() {
            report.push_str("\n## Identified Bottlenecks\n\n");
            for (i, b) in bottlenecks.iter().take(5).enumerate() {
                report.push_str(&format!(
                    "{}. {} (Step {}: {}) - {:?}\n",
                    i + 1,
                    b.workflow_name,
                    b.step_index,
                    b.action_type,
                    b.avg_duration
                ));
            }
        }

        Ok(report)
    }

    /// Export analytics data
    pub fn export(&self, path: &str) -> Result<()> {
        let analytics = self.get_analytics();
        let json = serde_json::to_string_pretty(&analytics)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    fn calculate_overall_metrics(&self) -> PerformanceMetrics {
        let total = self.execution_history.len() as u64;
        let successful = self.execution_history.iter().filter(|r| r.success).count() as u64;
        let failed = total - successful;

        let total_duration: Duration = self.execution_history
            .iter()
            .filter(|r| r.completed_at > r.started_at)
            .map(|r| Duration::from_secs(r.completed_at - r.started_at))
            .fold(Duration::ZERO, |acc, d| acc + d);

        let avg_duration = if total > 0 {
            total_duration / total as u32
        } else {
            Duration::ZERO
        };

        let durations: Vec<Duration> = self.execution_history
            .iter()
            .filter(|r| r.completed_at > r.started_at)
            .map(|r| Duration::from_secs(r.completed_at - r.started_at))
            .collect();

        PerformanceMetrics {
            total_executions: total,
            successful_executions: successful,
            failed_executions: failed,
            total_duration,
            average_duration: avg_duration,
            min_duration: durations.iter().min().cloned(),
            max_duration: durations.iter().max().cloned(),
            success_rate: if total > 0 { successful as f32 / total as f32 } else { 0.0 },
        }
    }

    fn calculate_hourly_distribution(&self) -> Vec<HourlyStat> {
        let mut hourly: HashMap<u8, (u64, u64)> = HashMap::new();

        for record in &self.execution_history {
            let hour = ((record.started_at % 86400) / 3600) as u8;
            let entry = hourly.entry(hour).or_insert((0, 0));
            entry.0 += 1;
            if record.completed_at > record.started_at {
                entry.1 += record.completed_at - record.started_at;
            }
        }

        let mut stats: Vec<HourlyStat> = hourly
            .into_iter()
            .map(|(hour, (executions, total_duration))| HourlyStat {
                hour,
                executions,
                avg_duration_ms: if executions > 0 { (total_duration * 1000 / executions) } else { 0 },
            })
            .collect();

        stats.sort_by(|a, b| a.hour.cmp(&b.hour));
        stats
    }

    fn calculate_trends(&self) -> Trends {
        Trends {
            daily_success_rate: self.get_success_rate_trend(30),
            weekly_executions: Vec::new(),
            monthly_failures: Vec::new(),
        }
    }

    fn update_workflow_metrics(&mut self, workflow_id: &str) {
        let workflow_records: Vec<&ExecutionRecord> = self.execution_history
            .iter()
            .filter(|r| r.workflow_id == workflow_id)
            .collect();

        let total = workflow_records.len() as u64;
        let successful = workflow_records.iter().filter(|r| r.success).count() as u64;

        let step_metrics = self.calculate_step_metrics(&workflow_records);

        let error_breakdown: HashMap<String, u32> = workflow_records
            .iter()
            .filter_map(|r| r.error.as_ref())
            .fold(HashMap::new(), |mut acc, error| {
                *acc.entry(error.clone()).or_insert(0) += 1;
                acc
            });

        let metrics = WorkflowMetrics {
            workflow_id: workflow_id.to_string(),
            name: workflow_id.to_string(),
            metrics: PerformanceMetrics {
                total_executions: total,
                successful_executions: successful,
                failed_executions: total - successful,
                success_rate: if total > 0 { successful as f32 / total as f32 } else { 0.0 },
                ..Default::default()
            },
            step_metrics,
            error_breakdown,
        };

        self.workflow_data.insert(workflow_id.to_string(), metrics);
    }

    fn calculate_step_metrics(&self, records: &[&ExecutionRecord]) -> Vec<StepMetric> {
        let mut step_data: HashMap<usize, Vec<&StepRecord>> = HashMap::new();

        for record in records {
            for (i, step) in record.steps.iter().enumerate() {
                step_data.entry(i).or_insert_with(Vec::new).push(step);
            }
        }

        step_data
            .into_iter()
            .map(|(index, steps)| {
                let avg_duration = if !steps.is_empty() {
                    let total: u64 = steps.iter().map(|s| s.duration_ms).sum();
                    Duration::from_millis(total / steps.len() as u64)
                } else {
                    Duration::ZERO
                };

                let failures = steps.iter().filter(|s| !s.success).count() as u32;
                let bottleneck_score = (avg_duration.as_millis() as f32 / 1000.0) + (failures as f32 * 10.0);

                StepMetric {
                    step_index: index,
                    action_type: steps.first().map(|s| s.action_type.clone()).unwrap_or_default(),
                    average_duration: avg_duration,
                    failure_count: failures,
                    bottleneck_score,
                }
            })
            .collect()
    }

    fn update_daily_stats(&mut self, success: bool, duration_secs: u64) {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let date = self.timestamp_to_date(now);

        let stats = self.daily_stats.entry(date).or_insert_with(|| DailyStats {
            date: String::new(),
            executions: 0,
            successes: 0,
            failures: 0,
            total_duration_ms: 0,
        });

        stats.executions += 1;
        if success {
            stats.successes += 1;
        } else {
            stats.failures += 1;
        }
        stats.total_duration_ms += duration_secs * 1000;
    }

    fn timestamp_to_date(&self, timestamp: u64) -> String {
        let days_since_epoch = timestamp / 86400;
        format!("{}", days_since_epoch)
    }
}

#[derive(Debug, Clone)]
pub struct WorkflowBottleneck {
    pub workflow_id: String,
    pub workflow_name: String,
    pub step_index: usize,
    pub action_type: String,
    pub avg_duration: Duration,
    pub bottleneck_score: f32,
}
