//! Performance types module

pub mod metrics;
pub mod config;
pub mod optimization;
pub mod resource;
pub mod report;
pub mod ux;

// Re-export main types for convenience
pub use metrics::{PerformanceMetric, PerformanceSnapshot, MetricCategory};
pub use config::PerformanceConfig;
pub use optimization::{PerformanceOptimization, OptimizationCategory, OptimizationImpact, OptimizationEffort, CommonOptimizations};
pub use resource::{MemoryUsage, CpuUsage};
pub use report::{PerformanceReport, MetricsSummary};
pub use ux::{
    UxImprovement, UxCategory, UxPriority, UxImpact, CommonUxImprovements,
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_performance_metric() {
        let metric = PerformanceMetric::new(
            "metric1",
            "Memory Usage",
            MetricCategory::Memory,
            1024.0,
            "MB",
        )
        .add_metadata("process", "ide");

        assert_eq!(metric.name, "Memory Usage");
        assert_eq!(metric.value, 1024.0);
        assert_eq!(metric.unit, "MB");
    }

    #[test]
    fn test_performance_snapshot() {
        let snapshot = PerformanceSnapshot::new()
            .with_memory_usage(MemoryUsage::new().with_used(512).with_total(1024))
            .with_cpu_usage(CpuUsage::new().with_user(25.0).with_system(10.0));

        assert_eq!(snapshot.memory_usage.usage_percentage(), 50.0);
        assert_eq!(snapshot.cpu_usage.usage_percentage(), 35.0);
    }

    #[test]
    fn test_performance_optimization() {
        let opt = PerformanceOptimization::new(
            "opt1",
            "Lazy Loading",
            "Load resources on demand",
            OptimizationCategory::Memory,
        )
        .with_impact(OptimizationImpact::High)
        .with_effort(OptimizationEffort::Medium)
        .with_applied(true);

        assert_eq!(opt.name, "Lazy Loading");
        assert_eq!(opt.impact, OptimizationImpact::High);
        assert!(opt.applied);
    }

    #[test]
    fn test_performance_report() {
        let report = PerformanceReport::new("Test Report")
            .with_duration(std::time::Duration::from_secs(10))
            .with_optimizations(vec![
                PerformanceOptimization::new(
                    "opt1",
                    "Lazy Loading",
                    "Load resources on demand",
                    OptimizationCategory::Memory,
                ),
            ])
            .with_recommendations(vec!["Enable lazy loading".to_string()]);

        assert_eq!(report.name, "Test Report");
        assert_eq!(report.optimization_count(), 1);
        assert_eq!(report.recommendation_count(), 1);
    }

    #[test]
    fn test_common_optimizations() {
        let opts = CommonOptimizations::all();
        assert!(opts.len() > 0);

        let memory_opts = CommonOptimizations::memory();
        assert_eq!(memory_opts.len(), 3);

        let cpu_opts = CommonOptimizations::cpu();
        assert_eq!(cpu_opts.len(), 3);
    }

    #[test]
    fn test_common_ux_improvements() {
        let improvements = CommonUxImprovements::all();
        assert!(improvements.len() > 0);
        assert_eq!(improvements.len(), 8);
    }
}
