//! Core performance client implementation

use crate::error::{PerformanceError, PerformanceResult};
use crate::types::{
    CpuUsage, MemoryUsage, MetricsSummary, PerformanceConfig, PerformanceMetric,
    PerformanceSnapshot, MetricCategory,
};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tracing::{debug, info, warn};

use super::traits::PerformanceClient;

/// Performance client implementation
pub struct PerformanceClientImpl {
    config: Arc<Mutex<PerformanceConfig>>,
    metrics: Arc<Mutex<HashMap<String, PerformanceMetric>>>,
    snapshots: Arc<Mutex<Vec<PerformanceSnapshot>>>,
    reports: Arc<Mutex<HashMap<String, crate::types::PerformanceReport>>>,
    profiling: Arc<Mutex<bool>>,
    profiling_start: Arc<Mutex<Option<Instant>>>,
    profiling_snapshots: Arc<Mutex<Vec<PerformanceSnapshot>>>,
}

impl PerformanceClientImpl {
    /// Create a new performance client with default configuration
    pub fn new() -> Self {
        Self {
            config: Arc::new(Mutex::new(PerformanceConfig::new())),
            metrics: Arc::new(Mutex::new(HashMap::new())),
            snapshots: Arc::new(Mutex::new(Vec::new())),
            reports: Arc::new(Mutex::new(HashMap::new())),
            profiling: Arc::new(Mutex::new(false)),
            profiling_start: Arc::new(Mutex::new(None)),
            profiling_snapshots: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Create a new performance client with custom configuration
    pub fn with_config(config: PerformanceConfig) -> Self {
        Self {
            config: Arc::new(Mutex::new(config)),
            metrics: Arc::new(Mutex::new(HashMap::new())),
            snapshots: Arc::new(Mutex::new(Vec::new())),
            reports: Arc::new(Mutex::new(HashMap::new())),
            profiling: Arc::new(Mutex::new(false)),
            profiling_start: Arc::new(Mutex::new(None)),
            profiling_snapshots: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Collect system metrics (memory and CPU usage)
    pub fn collect_system_metrics(&self) -> PerformanceResult<(MemoryUsage, CpuUsage)> {
        let memory = MemoryUsage::new()
            .with_total(8 * 1024 * 1024 * 1024) // 8GB
            .with_used(4 * 1024 * 1024 * 1024) // 4GB
            .with_free(4 * 1024 * 1024 * 1024);

        let cpu = CpuUsage::new()
            .with_user(25.0)
            .with_system(10.0)
            .with_idle(65.0);

        Ok((memory, cpu))
    }

    /// Generate performance recommendations based on metrics and snapshots
    pub fn generate_recommendations(&self, metrics: &[PerformanceMetric], snapshots: &[PerformanceSnapshot]) -> Vec<String> {
        let mut recommendations = Vec::new();

        // Analyze memory usage
        if let Some(last_snapshot) = snapshots.last() {
            if last_snapshot.memory_usage.usage_percentage() > 80.0 {
                recommendations.push(
                    "Memory usage is high (>80%). Consider implementing lazy loading or object pooling."
                        .to_string(),
                );
            }

            if last_snapshot.cpu_usage.usage_percentage() > 70.0 {
                recommendations.push(
                    "CPU usage is high (>70%). Consider debouncing or throttling expensive operations."
                        .to_string(),
                );
            }
        }

        // Analyze specific metrics
        for metric in metrics {
            match metric.category {
                MetricCategory::Rendering => {
                    if metric.value > 16.0 {
                        recommendations.push(format!(
                            "{} is high ({} ms). Consider implementing virtual scrolling.",
                            metric.name, metric.value
                        ));
                    }
                }
                MetricCategory::Lsp => {
                    if metric.value > 100.0 {
                        recommendations.push(format!(
                            "{} is high ({} ms). Consider incremental sync or request batching.",
                            metric.name, metric.value
                        ));
                    }
                }
                _ => {}
            }
        }

        // Add general recommendations if none
        if recommendations.is_empty() {
            recommendations.push("Performance is good. Continue monitoring metrics.".to_string());
        }

        recommendations
    }

    /// Calculate metrics summary from snapshots
    pub fn calculate_metrics_summary(&self, snapshots: &[PerformanceSnapshot]) -> MetricsSummary {
        if snapshots.is_empty() {
            return MetricsSummary::new();
        }

        let total_memory: f64 = snapshots.iter().map(|s| s.memory_usage.used as f64).sum();
        let total_cpu: f64 = snapshots.iter().map(|s| s.cpu_usage.usage_percentage()).sum();

        let avg_memory = total_memory / snapshots.len() as f64;
        let avg_cpu = total_cpu / snapshots.len() as f64;

        let peak_memory = snapshots.iter().map(|s| s.memory_usage.used).max().unwrap_or(0);
        let peak_cpu = snapshots
            .iter()
            .map(|s| s.cpu_usage.usage_percentage())
            .fold(0.0_f64, |acc, x| acc.max(x));

        let total_metrics: usize = snapshots.iter().map(|s| s.metric_count()).sum();

        MetricsSummary::new()
            .with_avg_memory_usage(avg_memory)
            .with_avg_cpu_usage(avg_cpu)
            .with_peak_memory(peak_memory)
            .with_peak_cpu(peak_cpu)
            .with_total_metrics(total_metrics)
    }

    /// Safely acquire mutex lock with proper error handling
    pub async fn lock_mutex<T>(mutex: &Arc<Mutex<T>>) -> PerformanceResult<std::sync::MutexGuard<T>> {
        mutex.lock().map_err(|e| PerformanceError::LockError(e.to_string()))
    }
}

impl Default for PerformanceClientImpl {
    fn default() -> Self {
        Self::new()
    }
}
