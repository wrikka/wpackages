//! Result types

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::types::core::{EvalId, EvalStatus, SampleResult};

/// Complete evaluation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalResult {
    pub id: EvalId,
    pub name: String,
    pub status: EvalStatus,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub total_samples: usize,
    pub passed_samples: usize,
    pub failed_samples: usize,
    pub average_score: f64,
    pub sample_results: Vec<SampleResult>,
    pub metrics: serde_json::Value,
}

impl EvalResult {
    /// Create a new evaluation result
    pub fn new(
        id: EvalId,
        name: String,
        started_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id,
            name,
            status: EvalStatus::Pending,
            started_at,
            completed_at: None,
            total_samples: 0,
            passed_samples: 0,
            failed_samples: 0,
            average_score: 0.0,
            sample_results: Vec::new(),
            metrics: serde_json::Value::Object(serde_json::Map::new()),
        }
    }

    /// Mark evaluation as started
    pub fn mark_started(&mut self) {
        self.status = EvalStatus::Running;
    }

    /// Mark evaluation as completed
    pub fn mark_completed(&mut self) {
        self.status = EvalStatus::Completed;
        self.completed_at = Some(Utc::now());
        self.calculate_statistics();
    }

    /// Mark evaluation as failed
    pub fn mark_failed(&mut self) {
        self.status = EvalStatus::Failed;
        self.completed_at = Some(Utc::now());
    }

    /// Add a sample result
    pub fn add_sample_result(&mut self, result: SampleResult) {
        self.total_samples += 1;
        
        if result.passed {
            self.passed_samples += 1;
        } else {
            self.failed_samples += 1;
        }

        self.sample_results.push(result);
    }

    /// Calculate statistics
    pub fn calculate_statistics(&mut self) {
        if self.total_samples == 0 {
            return;
        }

        let total_score: f64 = self.sample_results
            .iter()
            .map(|r| r.score)
            .sum();

        self.average_score = total_score / self.total_samples as f64;
    }

    /// Get pass rate
    pub fn pass_rate(&self) -> f64 {
        if self.total_samples == 0 {
            return 0.0;
        }
        self.passed_samples as f64 / self.total_samples as f64
    }

    /// Get failure rate
    pub fn failure_rate(&self) -> f64 {
        1.0 - self.pass_rate()
    }

    /// Get duration in milliseconds
    pub fn duration_ms(&self) -> Option<u64> {
        self.completed_at.map(|completed| {
            (completed - self.started_at).num_milliseconds() as u64
        })
    }

    /// Validate the result
    pub fn validate(&self) -> Result<(), String> {
        if self.name.is_empty() {
            return Err("Evaluation name cannot be empty".to_string());
        }

        if self.sample_results.len() != self.total_samples {
            return Err(
                "Sample results count does not match total samples".to_string()
            );
        }

        if self.passed_samples + self.failed_samples != self.total_samples {
            return Err(
                "Passed and failed samples count does not match total".to_string()
            );
        }

        if self.average_score < 0.0 || self.average_score > 1.0 {
            return Err("Average score must be between 0.0 and 1.0".to_string());
        }

        Ok(())
    }
}
