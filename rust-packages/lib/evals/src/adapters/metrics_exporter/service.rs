//! Metrics exporter service trait

use async_trait::async_trait;
use crate::error::{EvalError, EvalResult};

/// Trait for metrics export operations
#[async_trait]
pub trait MetricsExporter: Send + Sync {
    async fn export_metrics(&self, metrics: &[MetricData]) -> EvalResult<()>;
    async fn export_evaluation_summary(&self, summary: &EvaluationSummary) -> EvalResult<()>;
}
