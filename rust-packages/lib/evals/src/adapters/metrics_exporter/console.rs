//! Console metrics exporter

use async_trait::async_trait;

use crate::error::{EvalError, EvalResult};
use super::service::MetricsExporter;
use super::types::{MetricData, EvaluationSummary};

/// Console metrics exporter
pub struct ConsoleMetricsExporter {
    enabled: bool,
}

impl ConsoleMetricsExporter {
    /// Create new console metrics exporter
    pub fn new(enabled: bool) -> Self {
        Self { enabled }
    }

    /// Format metric data for console output
    fn format_metric(&self, metric: &MetricData) -> String {
        let tags_str = if metric.tags.is_empty() {
            String::new()
        } else {
            let tags: Vec<String> = metric.tags
                .iter()
                .map(|(k, v)| format!("{}={}", k, v))
                .collect();
            format!(" [{}]", tags.join(", "))
        };

        format!(
            "{}: {:.3} {}{} @ {}",
            metric.name,
            metric.value,
            metric.unit,
            tags_str,
            metric.timestamp.format("%Y-%m-%d %H:%M:%S UTC")
        )
    }

    /// Format evaluation summary for console output
    fn format_summary(&self, summary: &EvaluationSummary) -> String {
        let duration_str = summary.duration_ms
            .map(|d| format!("{}ms", d))
            .unwrap_or_else(|| "N/A".to_string());

        let latency_str = summary.average_latency_ms
            .map(|l| format!("{:.2}ms", l))
            .unwrap_or_else(|| "N/A".to_string());

        format!(
            "Evaluation Summary:\n  ID: {}\n  Name: {}\n  Status: {}\n  Duration: {}\n  Samples: {}/{} ({}%)\n  Avg Score: {:.3}\n  Avg Latency: {}",
            summary.eval_id,
            summary.name,
            summary.status,
            duration_str,
            summary.passed_samples,
            summary.total_samples,
            format!("{:.1}", summary.pass_rate * 100.0),
            summary.average_score,
            latency_str
        )
    }
}

#[async_trait]
impl MetricsExporter for ConsoleMetricsExporter {
    async fn export_metrics(&self, metrics: &[MetricData]) -> EvalResult<()> {
        if !self.enabled {
            return Ok(());
        }

        println!("\n=== Metrics Export ===");
        for metric in metrics {
            println!("{}", self.format_metric(metric));
        }
        println!("=== End Metrics ===\n");

        Ok(())
    }

    async fn export_evaluation_summary(&self, summary: &EvaluationSummary) -> EvalResult<()> {
        if !self.enabled {
            return Ok(());
        }

        println!("\n{}", self.format_summary(summary));
        Ok(())
    }
}
