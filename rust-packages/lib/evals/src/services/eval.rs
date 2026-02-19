//! Evaluation trait and implementations

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::{EvalSample, SampleResult};

/// Evaluation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalConfig {
    pub name: String,
    pub max_samples: Option<usize>,
    pub timeout_ms: Option<u64>,
    pub parallel: bool,
    pub max_concurrency: usize,
}

impl Default for EvalConfig {
    fn default() -> Self {
        Self {
            name: "default".to_string(),
            max_samples: None,
            timeout_ms: Some(30000),
            parallel: false,
            max_concurrency: 10,
        }
    }
}

/// Core evaluation trait
#[async_trait]
pub trait Eval: Send + Sync {
    /// Get evaluation name
    fn name(&self) -> &str;

    /// Get evaluation description
    fn description(&self) -> &str;

    /// Evaluate a single sample
    async fn evaluate(&self, sample: &EvalSample) -> SampleResult;

    /// Get evaluation configuration
    fn config(&self) -> EvalConfig {
        EvalConfig::default()
    }
}

/// Basic accuracy evaluation
pub struct AccuracyEval {
    name: String,
    description: String,
}

impl AccuracyEval {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            description: "Basic accuracy evaluation".to_string(),
        }
    }
}

#[async_trait]
impl Eval for AccuracyEval {
    fn name(&self) -> &str {
        &self.name
    }

    fn description(&self) -> &str {
        &self.description
    }

    async fn evaluate(&self, sample: &EvalSample) -> SampleResult {
        let start = std::time::Instant::now();
        
        // Basic exact match scoring
        let passed = sample.expected
            .as_ref()
            .map(|exp| sample.input == *exp)
            .unwrap_or(false);
        
        let score = if passed { 1.0 } else { 0.0 };

        SampleResult {
            sample_id: sample.id.clone(),
            output: sample.input.clone(),
            score,
            passed,
            latency_ms: start.elapsed().as_millis() as u64,
            error: None,
        }
    }
}
