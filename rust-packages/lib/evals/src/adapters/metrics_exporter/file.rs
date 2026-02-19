//! File metrics exporter

use async_trait::async_trait;
use std::path::PathBuf;

use crate::error::{EvalError, EvalResult};
use super::service::MetricsExporter;
use super::types::{MetricData, EvaluationSummary};

/// File metrics exporter
pub struct FileMetricsExporter {
    output_dir: PathBuf,
}

impl FileMetricsExporter {
    /// Create new file metrics exporter
    pub fn new(output_dir: PathBuf) -> Self {
        Self { output_dir }
    }

    /// Get metrics file path
    fn get_metrics_path(&self, eval_id: &str) -> PathBuf {
        self.output_dir.join(format!("{}_metrics.json", eval_id))
    }

    /// Get summary file path
    fn get_summary_path(&self, eval_id: &str) -> PathBuf {
        self.output_dir.join(format!("{}_summary.json", eval_id))
    }

    /// Ensure output directory exists
    async fn ensure_directory(&self) -> EvalResult<()> {
        tokio::fs::create_dir_all(&self.output_dir)
            .await
            .map_err(|e| EvalError::IoError(e))
    }

    /// Generate filename with timestamp
    fn generate_timestamped_filename(&self, base_name: &str) -> String {
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        format!("{}_{}.json", base_name, timestamp)
    }
}

#[async_trait]
impl MetricsExporter for FileMetricsExporter {
    async fn export_metrics(&self, metrics: &[MetricData]) -> EvalResult<()> {
        self.ensure_directory().await?;

        let filename = self.generate_timestamped_filename("metrics");
        let file_path = self.output_dir.join(&filename);

        let metrics_json = serde_json::to_string_pretty(metrics)
            .map_err(|e| EvalError::SerializationError(e))?;

        tokio::fs::write(&file_path, metrics_json)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        Ok(())
    }

    async fn export_evaluation_summary(&self, summary: &EvaluationSummary) -> EvalResult<()> {
        self.ensure_directory().await?;

        let file_path = self.get_summary_path(&summary.eval_id);

        let summary_json = serde_json::to_string_pretty(summary)
            .map_err(|e| EvalError::SerializationError(e))?;

        tokio::fs::write(&file_path, summary_json)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        Ok(())
    }
}
