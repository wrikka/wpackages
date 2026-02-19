//! Evaluation service types

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Evaluation progress information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationProgress {
    pub eval_id: String,
    pub total_samples: usize,
    pub completed_samples: usize,
    pub failed_samples: usize,
    pub current_sample_id: Option<String>,
    pub start_time: DateTime<Utc>,
    pub estimated_completion: Option<DateTime<Utc>>,
    pub pass_rate: f64,
}

impl EvaluationProgress {
    /// Create new evaluation progress
    pub fn new(eval_id: String, total_samples: usize) -> Self {
        Self {
            eval_id,
            total_samples,
            completed_samples: 0,
            failed_samples: 0,
            current_sample_id: None,
            start_time: Utc::now(),
            estimated_completion: None,
            pass_rate: 0.0,
        }
    }

    /// Update progress with completed sample
    pub fn update_completed(&mut self, sample_id: String, passed: bool) {
        self.completed_samples += 1;
        if passed {
            self.pass_rate = self.completed_samples as f64 / self.total_samples as f64;
        } else {
            self.failed_samples += 1;
            self.pass_rate = (self.completed_samples - self.failed_samples) as f64 / self.total_samples as f64;
        }
        self.current_sample_id = Some(sample_id);
        self.update_estimated_completion();
    }

    /// Update estimated completion time
    fn update_estimated_completion(&mut self) {
        if self.completed_samples == 0 {
            return;
        }

        let elapsed = Utc::now() - self.start_time;
        let avg_time_per_sample = elapsed.num_milliseconds() as f64 / self.completed_samples as f64;
        let remaining_samples = self.total_samples - self.completed_samples;
        let estimated_remaining_ms = (avg_time_per_sample * remaining_samples as f64) as i64;

        self.estimated_completion = Some(self.start_time + chrono::Duration::milliseconds(estimated_remaining_ms));
    }

    /// Get completion percentage
    pub fn completion_percentage(&self) -> f64 {
        if self.total_samples == 0 {
            0.0
        } else {
            (self.completed_samples as f64 / self.total_samples as f64) * 100.0
        }
    }

    /// Check if evaluation is complete
    pub fn is_complete(&self) -> bool {
        self.completed_samples >= self.total_samples
    }

    /// Get remaining samples
    pub fn remaining_samples(&self) -> usize {
        self.total_samples.saturating_sub(self.completed_samples)
    }
}

/// Evaluation statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationStats {
    pub total_samples: usize,
    pub passed_samples: usize,
    pub failed_samples: usize,
    pub pass_rate: f64,
    pub average_score: f64,
    pub average_latency_ms: f64,
    pub min_score: f64,
    pub max_score: f64,
    pub median_score: f64,
    pub std_deviation: f64,
    pub p95_latency_ms: f64,
    pub p99_latency_ms: f64,
}

impl EvaluationStats {
    /// Create new evaluation statistics
    pub fn new() -> Self {
        Self {
            total_samples: 0,
            passed_samples: 0,
            failed_samples: 0,
            pass_rate: 0.0,
            average_score: 0.0,
            average_latency_ms: 0.0,
            min_score: 0.0,
            max_score: 0.0,
            median_score: 0.0,
            std_deviation: 0.0,
            p95_latency_ms: 0.0,
            p99_latency_ms: 0.0,
        }
    }

    /// Calculate statistics from sample results
    pub fn from_samples(samples: &[crate::types::core::SampleResult]) -> Self {
        if samples.is_empty() {
            return Self::new();
        }

        let total_samples = samples.len();
        let passed_samples = samples.iter().filter(|s| s.passed).count();
        let failed_samples = total_samples - passed_samples;
        let pass_rate = passed_samples as f64 / total_samples as f64;

        let scores: Vec<f64> = samples.iter().map(|s| s.score).collect();
        let latencies: Vec<u64> = samples.iter().map(|s| s.latency_ms).collect();

        let average_score = scores.iter().sum::<f64>() / scores.len() as f64;
        let average_latency_ms = latencies.iter().sum::<u64>() as f64 / latencies.len() as f64;

        let mut sorted_scores = scores.clone();
        sorted_scores.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let min_score = sorted_scores[0];
        let max_score = sorted_scores[sorted_scores.len() - 1];
        let median_score = if sorted_scores.len() % 2 == 0 {
            let mid = sorted_scores.len() / 2;
            (sorted_scores[mid - 1] + sorted_scores[mid]) / 2.0
        } else {
            sorted_scores[sorted_scores.len() / 2]
        };

        let mean = average_score;
        let variance = scores.iter()
            .map(|score| (score - mean).powi(2))
            .sum::<f64>() / scores.len() as f64;
        let std_deviation = variance.sqrt();

        let mut sorted_latencies = latencies.clone();
        sorted_latencies.sort();
        let p95_latency_ms = sorted_latencies[(sorted_latencies.len() as f64 * 0.95) as usize] as f64;
        let p99_latency_ms = sorted_latencies[(sorted_latencies.len() as f64 * 0.99) as usize] as f64;

        Self {
            total_samples,
            passed_samples,
            failed_samples,
            pass_rate,
            average_score,
            average_latency_ms,
            min_score,
            max_score,
            median_score,
            std_deviation,
            p95_latency_ms,
            p99_latency_ms,
        }
    }
}

impl Default for EvaluationStats {
    fn default() -> Self {
        Self::new()
    }
}
