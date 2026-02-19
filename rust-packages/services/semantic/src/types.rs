use serde::{Deserialize, Serialize};

pub type Vector = Vec<f32>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub index: u32,
    pub score: f32,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum DistanceMetric {
    #[default]
    Cosine,
    Euclidean,
    Manhattan,
    DotProduct,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub vector: Vector,
    pub top_k: usize,
    pub threshold: Option<f32>,
    pub metric: Option<DistanceMetric>,
}

impl SearchQuery {
    pub fn new(vector: Vector, top_k: usize) -> Self {
        Self {
            vector,
            top_k,
            threshold: None,
            metric: None,
        }
    }

    pub fn with_threshold(mut self, threshold: f32) -> Self {
        self.threshold = Some(threshold);
        self
    }

    pub fn with_metric(mut self, metric: DistanceMetric) -> Self {
        self.metric = Some(metric);
        self
    }
}
