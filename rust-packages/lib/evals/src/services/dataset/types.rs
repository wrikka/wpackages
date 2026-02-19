//! Dataset service types

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Dataset format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatasetFormat {
    Json,
    Csv,
    Jsonl,
    Yaml,
    Custom(String),
}

/// Dataset source
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatasetSource {
    File(String),
    Url(String),
    Database(String),
    Memory,
}

/// Dataset information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatasetInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub format: DatasetFormat,
    pub source: DatasetSource,
    pub sample_count: usize,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub tags: Vec<String>,
    pub metadata: std::collections::HashMap<String, String>,
}

impl DatasetInfo {
    /// Create new dataset info
    pub fn new(
        id: String,
        name: String,
        description: String,
        format: DatasetFormat,
        source: DatasetSource,
        sample_count: usize,
    ) -> Self {
        Self {
            id,
            name,
            description,
            format,
            source,
            sample_count,
            created_at: Utc::now(),
            updated_at: None,
            tags: Vec::new(),
            metadata: std::collections::HashMap::new(),
        }
    }

    /// Add tag
    pub fn with_tag(mut self, tag: String) -> Self {
        self.tags.push(tag);
        self
    }

    /// Add metadata
    pub fn with_metadata(mut self, key: String, value: String) -> Self {
        self.metadata.insert(key, value);
        self
    }

    /// Set updated time
    pub fn with_updated_at(mut self, updated_at: DateTime<Utc>) -> Self {
        self.updated_at = Some(updated_at);
        self
    }
}

/// Dataset containing evaluation samples
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dataset {
    pub info: DatasetInfo,
    pub samples: Vec<crate::types::core::EvalSample>,
}

impl Dataset {
    /// Create new dataset
    pub fn new(info: DatasetInfo, samples: Vec<crate::types::core::EvalSample>) -> Self {
        Self { info, samples }
    }

    /// Get sample by ID
    pub fn get_sample(&self, sample_id: &str) -> Option<&crate::types::core::EvalSample> {
        self.samples.iter().find(|s| s.id == sample_id)
    }

    /// Get sample count
    pub fn len(&self) -> usize {
        self.samples.len()
    }

    /// Check if dataset is empty
    pub fn is_empty(&self) -> bool {
        self.samples.is_empty()
    }

    /// Split dataset into train/test
    pub fn split(&self, train_ratio: f64) -> (Dataset, Dataset) {
        let split_index = (self.samples.len() as f64 * train_ratio) as usize;
        
        let train_samples = self.samples[..split_index].to_vec();
        let test_samples = self.samples[split_index..].to_vec();

        let mut train_info = self.info.clone();
        train_info.id = format!("{}_train", self.info.id);
        train_info.name = format!("{} (Train)", self.info.name);
        train_info.sample_count = train_samples.len();
        train_info.updated_at = Some(Utc::now());

        let mut test_info = self.info.clone();
        test_info.id = format!("{}_test", self.info.id);
        test_info.name = format!("{} (Test)", self.info.name);
        test_info.sample_count = test_samples.len();
        test_info.updated_at = Some(Utc::now());

        let train_dataset = Dataset::new(train_info, train_samples);
        let test_dataset = Dataset::new(test_info, test_samples);

        (train_dataset, test_dataset)
    }

    /// Filter samples by criteria
    pub fn filter_samples<F>(&self, predicate: F) -> Dataset
    where
        F: Fn(&crate::types::core::EvalSample) -> bool,
    {
        let filtered_samples: Vec<crate::types::core::EvalSample> = self.samples
            .iter()
            .filter(|s| predicate(s))
            .cloned()
            .collect();

        let mut filtered_info = self.info.clone();
        filtered_info.id = format!("{}_filtered", self.info.id);
        filtered_info.name = format!("{} (Filtered)", self.info.name);
        filtered_info.sample_count = filtered_samples.len();
        filtered_info.updated_at = Some(Utc::now());

        Dataset::new(filtered_info, filtered_samples)
    }

    /// Take first n samples
    pub fn take(&self, n: usize) -> Dataset {
        let taken_samples: Vec<crate::types::core::EvalSample> = self.samples
            .iter()
            .take(n)
            .cloned()
            .collect();

        let mut taken_info = self.info.clone();
        taken_info.id = format!("{}_{}_samples", self.info.id, n);
        taken_info.name = format!("{} ({} samples)", self.info.name, n);
        taken_info.sample_count = taken_samples.len();
        taken_info.updated_at = Some(Utc::now());

        Dataset::new(taken_info, taken_samples)
    }

    /// Shuffle samples
    pub fn shuffle(&self) -> Dataset {
        use rand::seq::SliceRandom;
        use rand::thread_rng;

        let mut shuffled_samples = self.samples.clone();
        shuffled_samples.shuffle(&mut thread_rng());

        let mut shuffled_info = self.info.clone();
        shuffled_info.id = format!("{}_shuffled", self.info.id);
        shuffled_info.name = format!("{} (Shuffled)", self.info.name);
        shuffled_info.updated_at = Some(Utc::now());

        Dataset::new(shuffled_info, shuffled_samples)
    }
}
