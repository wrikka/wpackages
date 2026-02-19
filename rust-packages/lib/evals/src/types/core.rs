//! Core types for AI evaluations

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Unique evaluation ID
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalId(pub Uuid);

impl Default for EvalId {
    fn default() -> Self {
        Self(Uuid::new_v4())
    }
}

/// Evaluation status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum EvalStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

/// Single evaluation sample
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalSample {
    pub id: String,
    pub input: String,
    pub expected: Option<String>,
    pub metadata: serde_json::Value,
}

impl EvalSample {
    /// Create a new evaluation sample
    pub fn new(
        id: String,
        input: String,
        expected: Option<String>,
        metadata: serde_json::Value,
    ) -> Self {
        Self {
            id,
            input,
            expected,
            metadata,
        }
    }

    /// Create a sample with minimal data
    pub fn simple(id: String, input: String) -> Self {
        Self::new(id, input, None, serde_json::Value::Null)
    }

    /// Validate the sample
    pub fn validate(&self) -> Result<(), String> {
        if self.id.is_empty() {
            return Err("Sample ID cannot be empty".to_string());
        }

        if self.input.is_empty() {
            return Err("Sample input cannot be empty".to_string());
        }

        Ok(())
    }
}

/// Evaluation result for a single sample
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SampleResult {
    pub sample_id: String,
    pub output: String,
    pub score: f64,
    pub passed: bool,
    pub latency_ms: u64,
    pub error: Option<String>,
}

impl SampleResult {
    /// Create a new sample result
    pub fn new(
        sample_id: String,
        output: String,
        score: f64,
        passed: bool,
        latency_ms: u64,
    ) -> Self {
        Self {
            sample_id,
            output,
            score,
            passed,
            latency_ms,
            error: None,
        }
    }

    /// Create a failed sample result
    pub fn failed(sample_id: String, error: String) -> Self {
        Self {
            sample_id,
            output: String::new(),
            score: 0.0,
            passed: false,
            latency_ms: 0,
            error: Some(error),
        }
    }

    /// Validate the sample result
    pub fn validate(&self) -> Result<(), String> {
        if self.sample_id.is_empty() {
            return Err("Sample ID cannot be empty".to_string());
        }

        if self.score < 0.0 || self.score > 1.0 {
            return Err("Score must be between 0.0 and 1.0".to_string());
        }

        Ok(())
    }
}
