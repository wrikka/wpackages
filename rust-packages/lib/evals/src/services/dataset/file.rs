//! File-based dataset service

use async_trait::async_trait;
use std::path::PathBuf;

use crate::error::{EvalError, EvalResult};
use super::service::DatasetService;
use super::types::{Dataset, DatasetInfo, DatasetFormat, DatasetSource};
use crate::types::core::EvalSample;

/// File-based dataset service
pub struct FileDatasetService {
    base_path: PathBuf,
}

impl FileDatasetService {
    /// Create new file dataset service
    pub fn new(base_path: PathBuf) -> Self {
        Self { base_path }
    }

    /// Get dataset file path
    fn get_dataset_path(&self, dataset_id: &str) -> PathBuf {
        self.base_path.join(format!("{}.json", dataset_id))
    }

    /// Get dataset info file path
    fn get_info_path(&self, dataset_id: &str) -> PathBuf {
        self.base_path.join(format!("{}_info.json", dataset_id))
    }

    /// Ensure directory exists
    async fn ensure_directory(&self) -> EvalResult<()> {
        tokio::fs::create_dir_all(&self.base_path)
            .await
            .map_err(|e| EvalError::IoError(e))
    }

    /// Load dataset from JSON file
    async fn load_from_json(&self, file_path: &PathBuf) -> EvalResult<Dataset> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        let dataset: Dataset = serde_json::from_str(&content)
            .map_err(|e| EvalError::SerializationError(e))?;

        Ok(dataset)
    }

    /// Load dataset from CSV file
    async fn load_from_csv(&self, file_path: &PathBuf) -> EvalResult<Dataset> {
        let content = tokio::fs::read_to_string(file_path)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        let mut rdr = csv::Reader::from_reader(content.as_bytes());
        let mut samples = Vec::new();
        let mut record_count = 0;

        for result in rdr.records() {
            let record = result.map_err(|e| EvalError::IoError(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("CSV parsing error: {}", e)
            )))?;

            let sample = EvalSample {
                id: record.get(0).unwrap_or(&format!("sample_{}", record_count)).to_string(),
                input: record.get(1).unwrap_or("").to_string(),
                expected_output: record.get(2).unwrap_or("").to_string(),
                metadata: std::collections::HashMap::new(),
            };

            samples.push(sample);
            record_count += 1;
        }

        let dataset_info = DatasetInfo::new(
            file_path.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string(),
            format!("Dataset from {}", file_path.display()),
            format!("CSV dataset loaded from {}", file_path.display()),
            DatasetFormat::Csv,
            DatasetSource::File(file_path.to_string_lossy().to_string()),
            samples.len(),
        );

        Ok(Dataset::new(dataset_info, samples))
    }

    /// Save dataset to JSON file
    async fn save_to_json(&self, dataset: &Dataset, file_path: &PathBuf) -> EvalResult<()> {
        let content = serde_json::to_string_pretty(dataset)
            .map_err(|e| EvalError::SerializationError(e))?;

        tokio::fs::write(file_path, content)
            .await
            .map_err(|e| EvalError::IoError(e))
    }

    /// Save dataset info to separate file
    async fn save_info(&self, info: &DatasetInfo, info_path: &PathBuf) -> EvalResult<()> {
        let content = serde_json::to_string_pretty(info)
            .map_err(|e| EvalError::SerializationError(e))?;

        tokio::fs::write(info_path, content)
            .await
            .map_err(|e| EvalError::IoError(e))
    }

    /// Detect file format from extension
    fn detect_format(&self, file_path: &PathBuf) -> DatasetFormat {
        match file_path.extension().and_then(|s| s.to_str()) {
            Some("json") => DatasetFormat::Json,
            Some("csv") => DatasetFormat::Csv,
            Some("jsonl") => DatasetFormat::Jsonl,
            Some("yaml") | Some("yml") => DatasetFormat::Yaml,
            _ => DatasetFormat::Custom("unknown".to_string()),
        }
    }
}

#[async_trait]
impl DatasetService for FileDatasetService {
    async fn load_dataset(&self, dataset_id: &str) -> EvalResult<Dataset> {
        let dataset_path = self.get_dataset_path(dataset_id);

        if !dataset_path.exists() {
            return Err(EvalError::dataset_not_found(dataset_id.to_string()));
        }

        let format = self.detect_format(&dataset_path);

        match format {
            DatasetFormat::Json => self.load_from_json(&dataset_path).await,
            DatasetFormat::Csv => self.load_from_csv(&dataset_path).await,
            _ => Err(EvalError::invalid_configuration(
                format!("Unsupported dataset format: {:?}", format)
            )),
        }
    }

    async fn list_datasets(&self) -> EvalResult<Vec<DatasetInfo>> {
        if !self.base_path.exists() {
            return Ok(Vec::new());
        }

        let mut entries = tokio::fs::read_dir(&self.base_path)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        let mut datasets = Vec::new();

        while let Some(entry) = entries.next_entry().await
            .map_err(|e| EvalError::IoError(e))? 
        {
            let path = entry.path();
            
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                // Only load info files
                if file_name.ends_with("_info.json") {
                    let content = tokio::fs::read_to_string(&path)
                        .await
                        .map_err(|e| EvalError::IoError(e))?;

                    let info: DatasetInfo = serde_json::from_str(&content)
                        .map_err(|e| EvalError::SerializationError(e))?;

                    datasets.push(info);
                }
            }
        }

        // Sort by creation date (newest first)
        datasets.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        Ok(datasets)
    }

    async fn get_dataset_info(&self, dataset_id: &str) -> EvalResult<DatasetInfo> {
        let info_path = self.get_info_path(dataset_id);

        if !info_path.exists() {
            return Err(EvalError::dataset_not_found(dataset_id.to_string()));
        }

        let content = tokio::fs::read_to_string(&info_path)
            .await
            .map_err(|e| EvalError::IoError(e))?;

        let info: DatasetInfo = serde_json::from_str(&content)
            .map_err(|e| EvalError::SerializationError(e))?;

        Ok(info)
    }

    async fn save_dataset(&self, dataset: &Dataset) -> EvalResult<()> {
        self.ensure_directory().await?;

        let dataset_path = self.get_dataset_path(&dataset.info.id);
        let info_path = self.get_info_path(&dataset.info.id);

        // Save dataset
        self.save_to_json(dataset, &dataset_path).await?;

        // Save info
        self.save_info(&dataset.info, &info_path).await?;

        Ok(())
    }

    async fn delete_dataset(&self, dataset_id: &str) -> EvalResult<()> {
        let dataset_path = self.get_dataset_path(dataset_id);
        let info_path = self.get_info_path(dataset_id);

        let mut errors = Vec::new();

        if dataset_path.exists() {
            if let Err(e) = tokio::fs::remove_file(&dataset_path).await {
                errors.push(format!("Failed to remove dataset file: {}", e));
            }
        }

        if info_path.exists() {
            if let Err(e) = tokio::fs::remove_file(&info_path).await {
                errors.push(format!("Failed to remove info file: {}", e));
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
