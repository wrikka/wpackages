//! Metrics for evaluation

use serde::{Deserialize, Serialize};
use statrs::statistics::Statistics;

/// Metric result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricResult {
    pub name: String,
    pub value: f64,
    pub unit: String,
    pub description: String,
}

/// Metric trait
pub trait Metric: Send + Sync {
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn compute(&self, scores: &[f64]) -> MetricResult;
}

/// Accuracy metric
pub struct AccuracyMetric;

impl Metric for AccuracyMetric {
    fn name(&self) -> &str {
        "accuracy"
    }

    fn description(&self) -> &str {
        "Percentage of correct predictions"
    }

    fn compute(&self, scores: &[f64]) -> MetricResult {
        let accuracy = if scores.is_empty() {
            0.0
        } else {
            scores.iter().filter(|&&s| s >= 1.0).count() as f64 / scores.len() as f64
        };

        MetricResult {
            name: self.name().to_string(),
            value: accuracy,
            unit: "ratio".to_string(),
            description: self.description().to_string(),
        }
    }
}

/// Mean score metric
pub struct MeanScoreMetric;

impl Metric for MeanScoreMetric {
    fn name(&self) -> &str {
        "mean_score"
    }

    fn description(&self) -> &str {
        "Average score across all samples"
    }

    fn compute(&self, scores: &[f64]) -> MetricResult {
        let mean = if scores.is_empty() {
            0.0
        } else {
            scores.mean()
        };

        MetricResult {
            name: self.name().to_string(),
            value: mean,
            unit: "score".to_string(),
            description: self.description().to_string(),
        }
    }
}

/// Standard deviation metric
pub struct StdDevMetric;

impl Metric for StdDevMetric {
    fn name(&self) -> &str {
        "std_dev"
    }

    fn description(&self) -> &str {
        "Standard deviation of scores"
    }

    fn compute(&self, scores: &[f64]) -> MetricResult {
        let std_dev = if scores.len() < 2 {
            0.0
        } else {
            scores.std_dev()
        };

        MetricResult {
            name: self.name().to_string(),
            value: std_dev,
            unit: "score".to_string(),
            description: self.description().to_string(),
        }
    }
}
