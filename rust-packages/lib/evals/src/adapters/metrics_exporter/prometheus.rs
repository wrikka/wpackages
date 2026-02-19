//! Prometheus metrics exporter

use async_trait::async_trait;
use std::collections::HashMap;

use crate::error::{EvalError, EvalResult};
use super::service::MetricsExporter;
use super::types::{MetricData, EvaluationSummary};

/// Prometheus metrics exporter
pub struct PrometheusMetricsExporter {
    endpoint: String,
    namespace: String,
}

impl PrometheusMetricsExporter {
    /// Create new Prometheus metrics exporter
    pub fn new(endpoint: String, namespace: String) -> Self {
        Self {
            endpoint,
            namespace,
        }
    }

    /// Convert metric name to Prometheus format
    fn sanitize_metric_name(&self, name: &str) -> String {
        name.replace('.', "_")
            .replace('-', "_")
            .replace(' ', "_")
            .to_lowercase()
    }

    /// Convert metric data to Prometheus format
    fn format_metric(&self, metric: &MetricData) -> String {
        let metric_name = self.sanitize_metric_name(&metric.name);
        let full_name = if self.namespace.is_empty() {
            metric_name
        } else {
            format!("{}_{}", self.namespace, metric_name)
        };

        let tags_str = if metric.tags.is_empty() {
            String::new()
        } else {
            let tags: Vec<String> = metric.tags
                .iter()
                .map(|(k, v)| format!("{}=\"{}\"", k, v.replace('"', "\\\"")))
                .collect();
            format!("{{{}}}", tags.join(","))
        };

        format!(
            "# HELP {} {}\n# TYPE {} {}\n{}{} {:.6} {}\n",
            full_name,
            metric.name,
            full_name,
            self.get_metric_type(&metric.unit),
            full_name,
            tags_str,
            metric.value,
            self.get_unit_suffix(&metric.unit)
        )
    }

    /// Get Prometheus metric type from unit
    fn get_metric_type(&self, unit: &str) -> &'static str {
        match unit {
            "ms" | "seconds" | "duration" => "gauge",
            "count" | "number" => "counter",
            "percent" | "ratio" => "gauge",
            "score" | "value" => "gauge",
            _ => "gauge",
        }
    }

    /// Get unit suffix for Prometheus
    fn get_unit_suffix(&self, unit: &str) -> &'static str {
        match unit {
            "ms" => "ms",
            "seconds" => "s",
            "percent" | "ratio" => "",
            "count" | "number" => "",
            "score" | "value" => "",
            _ => "",
        }
    }

    /// Format evaluation summary for Prometheus
    fn format_summary(&self, summary: &EvaluationSummary) -> Vec<String> {
        let mut metrics = Vec::new();

        // Basic evaluation info
        let eval_info = MetricData::new(
            format!("{}_evaluation_info", self.namespace),
            1.0,
            "info".to_string(),
        )
        .with_tag("eval_id".to_string(), summary.eval_id.clone())
        .with_tag("name".to_string(), summary.name.clone())
        .with_tag("status".to_string(), summary.status.clone());

        metrics.push(self.format_metric(&eval_info));

        // Duration
        if let Some(duration_ms) = summary.duration_ms {
            let duration_metric = MetricData::new(
                format!("{}_evaluation_duration_ms", self.namespace),
                duration_ms as f64,
                "ms".to_string(),
            )
            .with_tag("eval_id".to_string(), summary.eval_id.clone());

            metrics.push(self.format_metric(&duration_metric));
        }

        // Sample counts
        let total_metric = MetricData::new(
            format!("{}_evaluation_samples_total", self.namespace),
            summary.total_samples as f64,
            "count".to_string(),
        )
        .with_tag("eval_id".to_string(), summary.eval_id.clone());

        let passed_metric = MetricData::new(
            format!("{}_evaluation_samples_passed", self.namespace),
            summary.passed_samples as f64,
            "count".to_string(),
        )
        .with_tag("eval_id".to_string(), summary.eval_id.clone());

        let failed_metric = MetricData::new(
            format!("{}_evaluation_samples_failed", self.namespace),
            summary.failed_samples as f64,
            "count".to_string(),
        )
        .with_tag("eval_id".to_string(), summary.eval_id.clone());

        metrics.extend([
            self.format_metric(&total_metric),
            self.format_metric(&passed_metric),
            self.format_metric(&failed_metric),
        ]);

        // Pass rate
        let pass_rate_metric = MetricData::new(
            format!("{}_evaluation_pass_rate", self.namespace),
            summary.pass_rate,
            "ratio".to_string(),
        )
        .with_tag("eval_id".to_string(), summary.eval_id.clone());

        metrics.push(self.format_metric(&pass_rate_metric));

        // Average score
        let avg_score_metric = MetricData::new(
            format!("{}_evaluation_average_score", self.namespace),
            summary.average_score,
            "score".to_string(),
        )
        .with_tag("eval_id".to_string(), summary.eval_id.clone());

        metrics.push(self.format_metric(&avg_score_metric));

        // Average latency
        if let Some(avg_latency) = summary.average_latency_ms {
            let latency_metric = MetricData::new(
                format!("{}_evaluation_average_latency_ms", self.namespace),
                avg_latency,
                "ms".to_string(),
            )
            .with_tag("eval_id".to_string(), summary.eval_id.clone());

            metrics.push(self.format_metric(&latency_metric));
        }

        metrics
    }

    /// Send metrics to Prometheus endpoint
    async fn send_to_prometheus(&self, metrics_text: &str) -> EvalResult<()> {
        let client = reqwest::Client::new();

        let response = client
            .post(&self.endpoint)
            .header("Content-Type", "text/plain")
            .body(metrics_text.to_string())
            .send()
            .await
            .map_err(|e| EvalError::model_error(format!("Failed to send metrics: {}", e)))?;

        if !response.status().is_success() {
            return Err(EvalError::model_error(
                format!("Prometheus push failed: {}", response.status())
            ));
        }

        Ok(())
    }
}

#[async_trait]
impl MetricsExporter for PrometheusMetricsExporter {
    async fn export_metrics(&self, metrics: &[MetricData]) -> EvalResult<()> {
        let mut metrics_text = String::new();

        for metric in metrics {
            metrics_text.push_str(&self.format_metric(metric));
        }

        if !metrics_text.is_empty() {
            self.send_to_prometheus(&metrics_text).await?;
        }

        Ok(())
    }

    async fn export_evaluation_summary(&self, summary: &EvaluationSummary) -> EvalResult<()> {
        let metrics = self.format_summary(summary);
        let metrics_text = metrics.join("\n");

        self.send_to_prometheus(&metrics_text).await
    }
}
