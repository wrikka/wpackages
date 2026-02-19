use crate::error::{PerformanceError, PerformanceResult};
use crate::types::{
    PerformanceConfig, PerformanceMetric, PerformanceOptimization, PerformanceReport,
    PerformanceSnapshot, UxImprovement,
};
use async_trait::async_trait;
use std::time::Duration;

/// Performance client trait
#[async_trait]
pub trait PerformanceClient: Send + Sync {
    /// Create performance snapshot
    async fn create_snapshot(&self) -> PerformanceResult<PerformanceSnapshot>;

    /// Get current metrics
    async fn get_metrics(&self) -> PerformanceResult<Vec<PerformanceMetric>>;

    /// Get metric by ID
    async fn get_metric(&self, id: &str) -> PerformanceResult<PerformanceMetric>;

    /// Record metric
    async fn record_metric(&self, metric: PerformanceMetric) -> PerformanceResult<()>;

    /// Get performance report
    async fn get_report(&self, report_id: &str) -> PerformanceResult<PerformanceReport>;

    /// Generate performance report
    async fn generate_report(&self, name: String, duration: Duration) -> PerformanceResult<PerformanceReport>;

    /// Get available optimizations
    async fn get_optimizations(&self) -> PerformanceResult<Vec<PerformanceOptimization>>;

    /// Apply optimization
    async fn apply_optimization(&self, optimization_id: &str) -> PerformanceResult<bool>;

    /// Get UX improvements
    async fn get_ux_improvements(&self) -> PerformanceResult<Vec<UxImprovement>>;

    /// Implement UX improvement
    async fn implement_ux_improvement(&self, improvement_id: &str) -> PerformanceResult<bool>;

    /// Get configuration
    async fn get_config(&self) -> PerformanceResult<PerformanceConfig>;

    /// Set configuration
    async fn set_config(&mut self, config: PerformanceConfig) -> PerformanceResult<()>;

    /// Start profiling
    async fn start_profiling(&mut self) -> PerformanceResult<()>;

    /// Stop profiling
    async fn stop_profiling(&mut self) -> PerformanceResult<PerformanceReport>;

    /// Is profiling
    async fn is_profiling(&self) -> PerformanceResult<bool>;

    /// Get recommendations
    async fn get_recommendations(&self) -> PerformanceResult<Vec<String>>;
}
