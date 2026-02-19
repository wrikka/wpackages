//! File-based storage service

use async_trait::async_trait;
use std::path::PathBuf;

use crate::error::{EvalError, EvalResult};
use super::service::StorageService;
use super::types::EvalSummary;
use crate::types::results::EvalResult as FullEvalResult;

/// File-based storage service
pub struct FileStorageService {
    base_path: PathBuf,
}

impl FileStorageService {
    /// Create a new file-based storage service
    pub fn new(base_path: PathBuf) -> Self {
        Self { base_path }
    }

    /// Get file path for evaluation result
    fn get_result_path(&self, eval_id: &str) -> PathBuf {
        self.base_path.join(format!("{}.json", eval_id))
    }

    /// Get file path for evaluation summary
    fn get_summary_path(&self, eval_id: &str) -> PathBuf {
        self.base_path.join(format!("{}_summary.json", eval_id))
    }

    /// Ensure directory exists
    async fn ensure_directory(&self) -> EvalResult<()> {
        tokio::fs::create_dir_all(&self.base_path)
            .await
            .map_err(|e| EvalError::IoError(e))
    }

    /// Convert evaluation result to summary
    fn result_to_summary(&self, result: &FullEvalResult) -> EvalSummary {
        EvalSummary::new(
            result.id.0.to_string(),
            result.name.clone(),
            format!("{:?}", result.status),
            result.started_at,
            result.completed_at,
            result.total_samples,
            result.pass_rate(),
        )
    }
}

#[async_trait]
impl StorageService for FileStorageService {
    async fn save_evaluation_result(&self, result: &FullEvalResult) -> EvalResult<()> {
        self.ensure_directory().await?;

        let result_path = self.get_result_path(&result.id.0.to_string());
        let summary_path = self.get_summary_path(&result.id.0.to_string());

        // Save full result
        let result_json = serde_json::to_value(result)
            .map_err(|e| EvalError::SerializationError(e))?;

        let result_content = serde_json::to_string_pretty(&result_json)
            .map_err(|e| EvalError::SerializationError(e))?;

        tokio::fs::write(&result_path, result_content)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        // Save summary
        let summary = self.result_to_summary(result);
        let summary_json = serde_json::to_value(&summary)
            .map_err(|e| EvalError::SerializationError(e))?;

        let summary_content = serde_json::to_string_pretty(&summary_json)
            .map_err(|e| EvalError::SerializationError(e))?;

        tokio::fs::write(&summary_path, summary_content)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        Ok(())
    }

    async fn load_evaluation_result(&self, eval_id: &str) -> EvalResult<FullEvalResult> {
        let result_path = self.get_result_path(eval_id);

        if !result_path.exists() {
            return Err(EvalError::dataset_not_found(eval_id.to_string()));
        }

        let content = tokio::fs::read_to_string(&result_path)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        let result: FullEvalResult = serde_json::from_str(&content)
            .map_err(|e| EvalError::SerializationError(e))?;

        Ok(result)
    }

    async fn list_evaluations(&self) -> EvalResult<Vec<EvalSummary>> {
        if !self.base_path.exists() {
            return Ok(Vec::new());
        }

        let mut entries = tokio::fs::read_dir(&self.base_path)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        let mut summaries = Vec::new();

        while let Some(entry) = entries.next_entry().await
            .map_err(|e| EvalError::IoError(e))? 
        {
            let path = entry.path();
            
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                // Only load summary files
                if file_name.ends_with("_summary.json") {
                    let content = tokio::fs::read_to_string(&path)
                        .await
                        .map_err(|e| EvalError::IoError(e))?;

                    let summary: EvalSummary = serde_json::from_str(&content)
                        .map_err(|e| EvalError::SerializationError(e))?;

                    summaries.push(summary);
                }
            }
        }

        // Sort by creation date (newest first)
        summaries.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        Ok(summaries)
    }

    async fn delete_evaluation(&self, eval_id: &str) -> EvalResult<()> {
        let result_path = self.get_result_path(eval_id);
        let summary_path = self.get_summary_path(eval_id);

        let mut errors = Vec::new();

        if result_path.exists() {
            if let Err(e) = tokio::fs::remove_file(&result_path).await {
                errors.push(format!("Failed to remove result file: {}", e));
            }
        }

        if summary_path.exists() {
            if let Err(e) = tokio::fs::remove_file(&summary_path).await {
                errors.push(format!("Failed to remove summary file: {}", e));
            }
        }

        if !errors.is_empty() {
            return Err(EvalError::IoError(std::io::Error::new(
                std::io::ErrorKind::Other,
                errors.join("; "),
            )));
        }

        Ok(())
    }
}
