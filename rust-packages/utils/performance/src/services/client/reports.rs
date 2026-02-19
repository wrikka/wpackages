//! Performance client reports and analysis operations

use crate::error::{PerformanceError, PerformanceResult};
use crate::types::{
    CommonOptimizations, PerformanceReport, PerformanceSnapshot, PerformanceMetric,
};
use std::time::Duration;
use tracing::info;

use super::core::PerformanceClientImpl;
use super::super::traits::PerformanceClient;

use async_trait::async_trait;

#[async_trait]
impl PerformanceClient for PerformanceClientImpl {
    async fn get_report(&self, report_id: &str) -> PerformanceResult<PerformanceReport> {
        let reports = Self::lock_mutex(&self.reports).await?;
        reports
            .get(report_id)
            .cloned()
            .ok_or_else(|| PerformanceError::ReportNotFound(report_id.to_string()))
    }

    async fn generate_report(&self, name: String, duration: Duration) -> PerformanceResult<PerformanceReport> {
        info!("Generating performance report: {}", name);

        let snapshots = Self::lock_mutex(&self.snapshots).await?;
        let metrics = Self::lock_mutex(&self.metrics).await?;

        let metrics_summary = self.calculate_metrics_summary(&snapshots);
        let recommendations = self.generate_recommendations(&metrics.values().cloned().collect::<Vec<_>>(), &snapshots);

        let optimizations = CommonOptimizations::all();

        let report = PerformanceReport::new(name)
            .with_duration(duration)
            .with_snapshots(snapshots.clone())
            .with_metrics_summary(metrics_summary)
            .with_optimizations(optimizations)
            .with_recommendations(recommendations);

        // Store report
        {
            let mut reports = Self::lock_mutex(&self.reports).await?;
            reports.insert(report.id.clone(), report.clone());
        }

        info!("Report generated: {}", report.display_summary());

        Ok(report)
    }

    async fn get_recommendations(&self) -> PerformanceResult<Vec<String>> {
        let snapshots = Self::lock_mutex(&self.snapshots).await?;
        let metrics = Self::lock_mutex(&self.metrics).await?;

        Ok(self.generate_recommendations(&metrics.values().cloned().collect::<Vec<_>>(), &snapshots))
    }
}
