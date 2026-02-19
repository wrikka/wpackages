//! Metrics exporter types

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Individual metric data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricData {
    pub name: String,
    pub value: f64,
    pub unit: String,
    pub timestamp: DateTime<Utc>,
    pub tags: std::collections::HashMap<String, String>,
}

impl MetricData {
    /// Create new metric data
    pub fn new(
        name: String,
        value: f64,
        unit: String,
    ) -> Self {
        Self {
            name,
            value,
            unit,
            timestamp: Utc::now(),
            tags: std::collections::HashMap::new(),
        }
    }

    /// Add tag
    pub fn with_tag(mut self, key: String, value: String) -> Self {
        self.tags.insert(key, value);
        self
    }

    /// Add multiple tags
    pub fn with_tags(mut self, tags: std::collections::HashMap<String, String>) -> Self {
        self.tags.extend(tags);
        self
    }

    /// Set timestamp
    pub fn with_timestamp(mut self, timestamp: DateTime<Utc>) -> Self {
        self.timestamp = timestamp;
        self
    }
}

/// Evaluation summary for metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationSummary {
    pub eval_id: String,
    pub name: String,
    pub status: String,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_ms: Option<u64>,
    pub total_samples: usize,
    pub passed_samples: usize,
    pub failed_samples: usize,
    pub pass_rate: f64,
    pub average_score: f64,
    pub average_latency_ms: Option<f64>,
}

impl EvaluationSummary {
    /// Create new evaluation summary
    pub fn new(
        eval_id: String,
        name: String,
        status: String,
        started_at: DateTime<Utc>,
    ) -> Self {
        Self {
            eval_id,
            name,
            status,
            started_at,
            completed_at: None,
            duration_ms: None,
            total_samples: 0,
            passed_samples: 0,
            failed_samples: 0,
            pass_rate: 0.0,
            average_score: 0.0,
            average_latency_ms: None,
        }
    }

    /// Set completion time
    pub fn with_completed_at(mut self, completed_at: DateTime<Utc>) -> Self {
        self.completed_at = Some(completed_at);
        self
    }

    /// Set duration in milliseconds
    pub fn with_duration_ms(mut self, duration_ms: u64) -> Self {
        self.duration_ms = Some(duration_ms);
        self
    }

    /// Set sample counts
    pub fn with_samples(
        mut self,
        total: usize,
        passed: usize,
        failed: usize,
    ) -> Self {
        self.total_samples = total;
        self.passed_samples = passed;
        self.failed_samples = failed;
        self.pass_rate = if total > 0 {
            passed as f64 / total as f64
        } else {
            0.0
        };
        self
    }

    /// Set average score
    pub fn with_average_score(mut self, average_score: f64) -> Self {
        self.average_score = average_score;
        self
    }

    /// Set average latency
    pub fn with_average_latency_ms(mut self, average_latency_ms: f64) -> Self {
        self.average_latency_ms = Some(average_latency_ms);
        self
    }
}
