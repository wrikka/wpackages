//! Performance client factory functions and tests

use super::core::PerformanceClientImpl;
use super::super::traits::PerformanceClient;
use crate::types::PerformanceConfig;
use std::time::Duration;

/// Create a new performance client
pub fn create_performance_client() -> PerformanceClientImpl {
    PerformanceClientImpl::new()
}

/// Create a new performance client with custom configuration
pub fn create_performance_client_with_config(config: PerformanceConfig) -> PerformanceClientImpl {
    PerformanceClientImpl::with_config(config)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_performance_client() {
        let client = create_performance_client();

        // Create snapshot
        let snapshot = client.create_snapshot().await.unwrap();

        assert_eq!(snapshot.metric_count(), 2);
        assert!(snapshot.memory_usage.usage_percentage() > 0.0);

        // Get metrics
        let metrics = client.get_metrics().await.unwrap();
        assert_eq!(metrics.len(), 2);

        // Get config
        let config = client.get_config().await.unwrap();
        assert!(config.enable_profiling);
    }

    #[tokio::test]
    async fn test_profiling() {
        let mut client = create_performance_client();

        // Start profiling
        client.start_profiling().await.unwrap();
        assert!(client.is_profiling().await.unwrap());

        // Create snapshot while profiling
        client.create_snapshot().await.unwrap();

        // Stop profiling
        let report = client.stop_profiling().await.unwrap();

        assert!(!client.is_profiling().await.unwrap());
        assert_eq!(report.name, "Profiling Report");
        assert_eq!(report.snapshot_count(), 1);
    }

    #[tokio::test]
    async fn test_optimizations() {
        let client = create_performance_client();

        let optimizations = client.get_optimizations().await.unwrap();
        assert!(optimizations.len() > 0);

        // Apply optimization
        let applied = client.apply_optimization("opt1").await.unwrap();
        assert!(applied);
    }

    #[tokio::test]
    async fn test_ux_improvements() {
        let client = create_performance_client();

        let improvements = client.get_ux_improvements().await.unwrap();
        assert_eq!(improvements.len(), 8);

        // Implement improvement
        let implemented = client.implement_ux_improvement("ux1").await.unwrap();
        assert!(implemented);
    }

    #[tokio::test]
    async fn test_generate_report() {
        let client = create_performance_client();

        // Create some snapshots
        client.create_snapshot().await.unwrap();
        client.create_snapshot().await.unwrap();

        let report = client
            .generate_report("Test Report".to_string(), Duration::from_secs(10))
            .await
            .unwrap();

        assert_eq!(report.name, "Test Report");
        assert_eq!(report.snapshot_count(), 2);
        assert!(report.recommendation_count() > 0);
    }

    #[tokio::test]
    async fn test_recommendations() {
        let client = create_performance_client();

        let recommendations = client.get_recommendations().await.unwrap();
        assert!(recommendations.len() > 0);
    }

    #[tokio::test]
    async fn test_custom_config() {
        let config = PerformanceConfig::new().with_profiling(false);
        let client = create_performance_client_with_config(config);

        let client_config = client.get_config().await.unwrap();
        assert!(!client_config.enable_profiling);
    }
}
