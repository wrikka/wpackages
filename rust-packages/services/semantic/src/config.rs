use crate::error::{VectorSearchError, VectorSearchResult};
use crate::types::DistanceMetric;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorSearchConfig {
    pub dimension: usize,
    pub default_metric: DistanceMetric,
    pub parallel: bool,
}

impl VectorSearchConfig {
    pub fn new(dimension: usize) -> Self {
        Self {
            dimension,
            default_metric: DistanceMetric::Cosine,
            parallel: true,
        }
    }

    pub fn with_metric(mut self, metric: DistanceMetric) -> Self {
        self.default_metric = metric;
        self
    }

    pub fn with_parallel(mut self, parallel: bool) -> Self {
        self.parallel = parallel;
        self
    }

    pub fn validate(&self) -> VectorSearchResult<()> {
        if self.dimension == 0 {
            return Err(VectorSearchError::InvalidConfig(
                "Dimension must be greater than 0".to_string(),
            ));
        }
        Ok(())
    }
}

impl Default for VectorSearchConfig {
    fn default() -> Self {
        Self::new(768)
    }
}
