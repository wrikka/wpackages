//! Dataset handling for evaluations

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::EvalSample;

/// Dataset trait
#[async_trait]
pub trait Dataset: Send + Sync {
    fn name(&self) -> &str;
    fn len(&self) -> usize;
    fn is_empty(&self) -> bool {
        self.len() == 0
    }
    async fn get_sample(&self, index: usize) -> Option<EvalSample>;
    async fn iter(&self) -> Box<dyn Iterator<Item = EvalSample> + Send + '_>;
}

/// Dataset loader trait
#[async_trait]
pub trait DatasetLoader: Send + Sync {
    async fn load(&self) -> Result<Box<dyn Dataset>, DatasetError>;
}

/// Dataset error
#[derive(Debug, thiserror::Error)]
pub enum DatasetError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Parse error: {0}")]
    Parse(String),
    
    #[error("Invalid format: {0}")]
    InvalidFormat(String),
}

/// In-memory dataset
pub struct InMemoryDataset {
    name: String,
    samples: Vec<EvalSample>,
}

impl InMemoryDataset {
    pub fn new(name: impl Into<String>, samples: Vec<EvalSample>) -> Self {
        Self {
            name: name.into(),
            samples,
        }
    }

    pub fn from_json(name: impl Into<String>, json: &str) -> Result<Self, DatasetError> {
        let samples: Vec<EvalSample> = serde_json::from_str(json)
            .map_err(|e| DatasetError::Parse(e.to_string()))?;
        Ok(Self::new(name, samples))
    }
}

#[async_trait]
impl Dataset for InMemoryDataset {
    fn name(&self) -> &str {
        &self.name
    }

    fn len(&self) -> usize {
        self.samples.len()
    }

    async fn get_sample(&self, index: usize) -> Option<EvalSample> {
        self.samples.get(index).cloned()
    }

    async fn iter(&self) -> Box<dyn Iterator<Item = EvalSample> + Send + '_> {
        Box::new(self.samples.iter().cloned())
    }
}
