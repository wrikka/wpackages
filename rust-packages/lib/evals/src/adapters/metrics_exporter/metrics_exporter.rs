//! Metrics exporter adapter for external metrics systems

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Metric value types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MetricValue {
    Counter { value: u64 },
    Gauge { value: f64 },
    Histogram { buckets: Vec<(f64, u64)>, count: u64, sum: f64 },
    Summary { quantiles: Vec<(f64, f64)>, count: u64, sum: f64 },
}

/// Metric data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricDataPoint {
    pub name: String,
    pub value: MetricValue,
    pub labels: HashMap<String, String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

impl MetricDataPoint {
    /// Create new counter metric
    pub fn counter(name: String, value: u64, labels: HashMap<String, String>) -> Self {
        Self {
            name,
            value: MetricValue::Counter { value },
            labels,
            timestamp: chrono::Utc::now(),
        }
    }

    /// Create new gauge metric
    pub fn gauge(name: String, value: f64, labels: HashMap<String, String>) -> Self {
        Self {
            name,
            value: MetricValue::Gauge { value },
            labels,
            timestamp: chrono::Utc::now(),
        }
    }

    /// Create new histogram metric
    pub fn histogram(
        name: String,
        buckets: Vec<(f64, u64)>,
        count: u64,
        sum: f64,
        labels: HashMap<String, String>,
    ) -> Self {
        Self {
            name,
            value: MetricValue::Histogram { buckets, count, sum },
            labels,
            timestamp: chrono::Utc::now(),
        }
    }

    /// Create new summary metric
    pub fn summary(
        name: String,
        quantiles: Vec<(f64, f64)>,
        count: u64,
        sum: f64,
        labels: HashMap<String, String>,
    ) -> Self {
        Self {
            name,
            value: MetricValue::Summary { quantiles, count, sum },
            labels,
            timestamp: chrono::Utc::now(),
        }
    }
}

/// Metrics exporter trait
pub trait MetricsExporter: Send + Sync {
    fn export(&self, metrics: &[MetricDataPoint]) -> crate::error::EvalResult<()>;
    fn flush(&self) -> crate::error::EvalResult<()>;
}

/// Console metrics exporter
pub struct ConsoleMetricsExporter {
    logger: crate::adapters::logger::Logger,
}

impl ConsoleMetricsExporter {
    /// Create new console exporter
    pub fn new() -> Self {
        Self {
            logger: crate::adapters::logger::LoggerFactory::create("metrics_exporter"),
        }
    }
}

impl MetricsExporter for ConsoleMetricsExporter {
    fn export(&self, metrics: &[MetricDataPoint]) -> crate::error::EvalResult<()> {
        for metric in metrics {
            let labels_str = metric
                .labels
                .iter()
                .map(|(k, v)| format!("{}={}", k, v))
                .collect::<Vec<_>>()
                .join(",");

            match &metric.value {
                MetricValue::Counter { value } => {
                    self.logger.info(
                        "Counter metric",
                        &[
                            ("name", &metric.name.as_str()),
                            ("value", &value.to_string()),
                            ("labels", &labels_str.as_str()),
                        ],
                    );
                }
                MetricValue::Gauge { value } => {
                    self.logger.info(
                        "Gauge metric",
                        &[
                            ("name", &metric.name.as_str()),
                            ("value", &value.to_string()),
                            ("labels", &labels_str.as_str()),
                        ],
                    );
                }
                MetricValue::Histogram { count, sum, .. } => {
                    self.logger.info(
                        "Histogram metric",
                        &[
                            ("name", &metric.name.as_str()),
                            ("count", &count.to_string()),
                            ("sum", &sum.to_string()),
                            ("labels", &labels_str.as_str()),
                        ],
                    );
                }
                MetricValue::Summary { count, sum, .. } => {
                    self.logger.info(
                        "Summary metric",
                        &[
                            ("name", &metric.name.as_str()),
                            ("count", &count.to_string()),
                            ("sum", &sum.to_string()),
                            ("labels", &labels_str.as_str()),
                        ],
                    );
                }
            }
        }

        Ok(())
    }

    fn flush(&self) -> crate::error::EvalResult<()> {
        // Console exporter doesn't need flushing
        Ok(())
    }
}

/// File metrics exporter
pub struct FileMetricsExporter {
    file_path: std::path::PathBuf,
}

impl FileMetricsExporter {
    /// Create new file exporter
    pub fn new(file_path: std::path::PathBuf) -> Self {
        Self { file_path }
    }

    /// Ensure directory exists
    async fn ensure_directory(&self) -> crate::error::EvalResult<()> {
        if let Some(parent) = self.file_path.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .map_err(|e| crate::error::EvalError::IoError(e))?;
        }
        Ok(())
    }
}

impl MetricsExporter for FileMetricsExporter {
    fn export(&self, metrics: &[MetricDataPoint]) -> crate::error::EvalResult<()> {
        let rt = tokio::runtime::Handle::current();
        rt.block_on(async {
            self.ensure_directory().await?;

            let json_content = serde_json::to_string_pretty(metrics)
                .map_err(|e| crate::error::EvalError::SerializationError(e))?;

            tokio::fs::write(&self.file_path, json_content)
                .await
                .map_err(|e| crate::error::EvalError::IoError(e))?;

            Ok(())
        })
    }

    fn flush(&self) -> crate::error::EvalResult<()> {
        // File exporter doesn't need explicit flushing
        Ok(())
    }
}

/// Prometheus metrics exporter
pub struct PrometheusMetricsExporter {
    endpoint: String,
    client: crate::adapters::http_client::HttpClient,
}

impl PrometheusMetricsExporter {
    /// Create new Prometheus exporter
    pub fn new(endpoint: String) -> Self {
        Self {
            endpoint,
            client: crate::adapters::http_client::HttpClient::new(endpoint.clone()),
        }
    }

    /// Convert metric data point to Prometheus format
    fn to_prometheus_format(&self, metric: &MetricDataPoint) -> String {
        let labels_str = if metric.labels.is_empty() {
            String::new()
        } else {
            let labels = metric
                .labels
                .iter()
                .map(|(k, v)| format!("{}=\"{}\"", k, v))
                .collect::<Vec<_>>()
                .join(",");
            format!("{{{}}}", labels)
        };

        match &metric.value {
            MetricValue::Counter { value } => {
                format!("{}_total{} {}\n", metric.name, labels_str, value)
            }
            MetricValue::Gauge { value } => {
                format!("{}{} {}\n", metric.name, labels_str, value)
            }
            MetricValue::Histogram { count, sum, .. } => {
                format!(
                    "{}_count{} {}\n{}_sum{} {}\n",
                    metric.name, labels_str, count, metric.name, labels_str, sum
                )
            }
            MetricValue::Summary { count, sum, .. } => {
                format!(
                    "{}_count{} {}\n{}_sum{} {}\n",
                    metric.name, labels_str, count, metric.name, labels_str, sum
                )
            }
        }
    }
}

impl MetricsExporter for PrometheusMetricsExporter {
    fn export(&self, metrics: &[MetricDataPoint]) -> crate::error::EvalResult<()> {
        let prometheus_data: String = metrics
            .iter()
            .map(|metric| self.to_prometheus_format(metric))
            .collect();

        // Send to Prometheus pushgateway or similar
        // This is a simplified implementation
        self.client
            .post::<serde_json::Value>("/metrics/job/evals", &serde_json::json!({}))
            .map_err(|e| crate::error::EvalError::model_error(format!("Failed to export to Prometheus: {}", e)))?;

        Ok(())
    }

    fn flush(&self) -> crate::error::EvalResult<()> {
        // Prometheus exporter doesn't need explicit flushing
        Ok(())
    }
}

/// Metrics collector
pub struct MetricsCollector {
    exporters: Vec<Box<dyn MetricsExporter>>,
    buffer: Vec<MetricDataPoint>,
    buffer_size: usize,
}

impl MetricsCollector {
    /// Create new metrics collector
    pub fn new(buffer_size: usize) -> Self {
        Self {
            exporters: Vec::new(),
            buffer: Vec::with_capacity(buffer_size),
            buffer_size,
        }
    }

    /// Add exporter
    pub fn add_exporter(mut self, exporter: Box<dyn MetricsExporter>) -> Self {
        self.exporters.push(exporter);
        self
    }

    /// Record metric
    pub fn record(&mut self, metric: MetricDataPoint) -> crate::error::EvalResult<()> {
        self.buffer.push(metric);

        if self.buffer.len() >= self.buffer_size {
            self.flush()?;
        }

        Ok(())
    }

    /// Flush all metrics
    pub fn flush(&mut self) -> crate::error::EvalResult<()> {
        if self.buffer.is_empty() {
            return Ok(());
        }

        let metrics = self.buffer.drain(..).collect::<Vec<_>>();

        for exporter in &self.exporters {
            exporter.export(&metrics)?;
            exporter.flush()?;
        }

        Ok(())
    }

    /// Get current buffer size
    pub fn buffer_size(&self) -> usize {
        self.buffer.len()
    }
}
