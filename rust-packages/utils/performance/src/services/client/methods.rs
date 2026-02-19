//! Performance client metrics operations

use crate::error::{PerformanceError, PerformanceResult};
use crate::types::{PerformanceMetric, PerformanceSnapshot, MetricCategory};
use tracing::debug;

use super::core::PerformanceClientImpl;
use super::super::traits::PerformanceClient;

use async_trait::async_trait;

#[async_trait]
impl PerformanceClient for PerformanceClientImpl {
    async fn create_snapshot(&self) -> PerformanceResult<PerformanceSnapshot> {
        debug!("Creating performance snapshot");

        let (memory, cpu) = self.collect_system_metrics()?;

        let mut snapshot = PerformanceSnapshot::new()
            .with_memory_usage(memory)
            .with_cpu_usage(cpu);

        // Add sample metrics
        let render_metric = PerformanceMetric::new(
            "render_time",
            "Render Time",
            MetricCategory::Rendering,
            16.5,
            "ms",
        );

        let lsp_metric = PerformanceMetric::new(
            "lsp_response",
            "LSP Response Time",
            MetricCategory::Lsp,
            45.2,
            "ms",
        );

        snapshot.metrics.push(render_metric);
        snapshot.metrics.push(lsp_metric);

        // Store snapshot
        {
            let mut snapshots = Self::lock_mutex(&self.snapshots).await?;
            snapshots.push(snapshot.clone());
        }

        // Store metrics
        {
            let mut metrics = Self::lock_mutex(&self.metrics).await?;
            for metric in &snapshot.metrics {
                metrics.insert(metric.id.clone(), metric.clone());
            }
        }

        // If profiling, add to profiling snapshots
        {
            let profiling = Self::lock_mutex(&self.profiling).await?;
            if *profiling {
                let mut profiling_snapshots = Self::lock_mutex(&self.profiling_snapshots).await?;
                profiling_snapshots.push(snapshot.clone());
            }
        }

        Ok(snapshot)
    }

    async fn get_metrics(&self) -> PerformanceResult<Vec<PerformanceMetric>> {
        let metrics = Self::lock_mutex(&self.metrics).await?;
        Ok(metrics.values().cloned().collect())
    }

    async fn get_metric(&self, id: &str) -> PerformanceResult<PerformanceMetric> {
        let metrics = Self::lock_mutex(&self.metrics).await?;
        metrics
            .get(id)
            .cloned()
            .ok_or_else(|| PerformanceError::MetricNotFound(id.to_string()))
    }

    async fn record_metric(&self, metric: PerformanceMetric) -> PerformanceResult<()> {
        let mut metrics = Self::lock_mutex(&self.metrics).await?;
        metrics.insert(metric.id.clone(), metric);
        Ok(())
    }
}
