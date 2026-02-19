//! Performance report types

use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Performance report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceReport {
    pub id: String,
    pub name: String,
    pub duration: Duration,
    pub snapshots: Vec<super::PerformanceSnapshot>,
    pub metrics_summary: MetricsSummary,
    pub optimizations: Vec<PerformanceOptimization>,
    pub recommendations: Vec<String>,
}

impl PerformanceReport {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            duration: Duration::ZERO,
            snapshots: Vec::new(),
            metrics_summary: MetricsSummary::new(),
            optimizations: Vec::new(),
            recommendations: Vec::new(),
        }
    }

    pub fn with_duration(mut self, duration: Duration) -> Self {
        self.duration = duration;
        self
    }

    pub fn with_snapshots(mut self, snapshots: Vec<super::PerformanceSnapshot>) -> Self {
        self.snapshots = snapshots;
        self
    }

    pub fn with_metrics_summary(mut self, summary: MetricsSummary) -> Self {
        self.metrics_summary = summary;
        self
    }

    pub fn with_optimizations(mut self, optimizations: Vec<PerformanceOptimization>) -> Self {
        self.optimizations = optimizations;
        self
    }

    pub fn with_recommendations(mut self, recommendations: Vec<String>) -> Self {
        self.recommendations = recommendations;
        self
    }

    pub fn snapshot_count(&self) -> usize {
        self.snapshots.len()
    }

    pub fn optimization_count(&self) -> usize {
        self.optimizations.len()
    }

    pub fn recommendation_count(&self) -> usize {
        self.recommendations.len()
    }

    pub fn display_summary(&self) -> String {
        format!(
            "Report: {} ({} snapshots, {} optimizations, {} recommendations)",
            self.name,
            self.snapshot_count(),
            self.optimization_count(),
            self.recommendation_count()
        )
    }
}

/// Metrics summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsSummary {
    pub avg_memory_usage: f64,
    pub avg_cpu_usage: f64,
    pub peak_memory: u64,
    pub peak_cpu: f64,
    pub total_metrics: usize,
}

impl MetricsSummary {
    pub fn new() -> Self {
        Self {
            avg_memory_usage: 0.0,
            avg_cpu_usage: 0.0,
            peak_memory: 0,
            peak_cpu: 0.0,
            total_metrics: 0,
        }
    }

    pub fn with_avg_memory_usage(mut self, avg: f64) -> Self {
        self.avg_memory_usage = avg;
        self
    }

    pub fn with_avg_cpu_usage(mut self, avg: f64) -> Self {
        self.avg_cpu_usage = avg;
        self
    }

    pub fn with_peak_memory(mut self, peak: u64) -> Self {
        self.peak_memory = peak;
        self
    }

    pub fn with_peak_cpu(mut self, peak: f64) -> Self {
        self.peak_cpu = peak;
        self
    }

    pub fn with_total_metrics(mut self, total: usize) -> Self {
        self.total_metrics = total;
        self
    }
}

impl Default for PerformanceReport {
    fn default() -> Self {
        Self::new("Default Report")
    }
}

impl Default for MetricsSummary {
    fn default() -> Self {
        Self::new()
    }
}
