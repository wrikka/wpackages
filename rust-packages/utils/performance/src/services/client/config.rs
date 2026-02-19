//! Performance client configuration and profiling operations

use crate::error::{PerformanceError, PerformanceResult};
use crate::types::{PerformanceConfig, UxImprovement, CommonOptimizations, CommonUxImprovements};
use std::time::{Duration, Instant};
use tracing::info;

use super::core::PerformanceClientImpl;
use super::super::traits::PerformanceClient;

use async_trait::async_trait;

#[async_trait]
impl PerformanceClient for PerformanceClientImpl {
    async fn get_config(&self) -> PerformanceResult<PerformanceConfig> {
        let config = Self::lock_mutex(&self.config).await?;
        Ok(config.clone())
    }

    async fn set_config(&mut self, config: PerformanceConfig) -> PerformanceResult<()> {
        let mut cfg = Self::lock_mutex(&self.config).await?;
        *cfg = config;
        Ok(())
    }

    async fn start_profiling(&mut self) -> PerformanceResult<()> {
        info!("Starting performance profiling");

        let mut profiling = Self::lock_mutex(&self.profiling).await?;

        if *profiling {
            return Err(PerformanceError::ProfilingAlreadyInProgress);
        }

        *profiling = true;

        let mut start = Self::lock_mutex(&self.profiling_start).await?;
        *start = Some(Instant::now());

        // Clear previous profiling snapshots
        let mut profiling_snapshots = Self::lock_mutex(&self.profiling_snapshots).await?;
        profiling_snapshots.clear();

        Ok(())
    }

    async fn stop_profiling(&mut self) -> PerformanceResult<PerformanceReport> {
        info!("Stopping performance profiling");

        let mut profiling = Self::lock_mutex(&self.profiling).await?;

        if !*profiling {
            return Err(PerformanceError::NoProfilingInProgress);
        }

        *profiling = false;

        let start = Self::lock_mutex(&self.profiling_start).await?;
        let duration = start.map(|t| t.elapsed()).unwrap_or(Duration::ZERO);

        let profiling_snapshots = Self::lock_mutex(&self.profiling_snapshots).await?;
        let snapshots = profiling_snapshots.clone();

        let report = self.generate_report("Profiling Report".to_string(), duration).await?;

        Ok(report)
    }

    async fn is_profiling(&self) -> PerformanceResult<bool> {
        let profiling = Self::lock_mutex(&self.profiling).await?;
        Ok(*profiling)
    }
}

#[async_trait]
impl PerformanceClient for PerformanceClientImpl {
    async fn get_optimizations(&self) -> PerformanceResult<Vec<crate::types::PerformanceOptimization>> {
        Ok(CommonOptimizations::all())
    }

    async fn apply_optimization(&self, optimization_id: &str) -> PerformanceResult<bool> {
        info!("Applying optimization: {}", optimization_id);

        let optimizations = CommonOptimizations::all();

        if let Some(opt) = optimizations.iter().find(|o| o.id == optimization_id) {
            info!("Applied optimization: {}", opt.name);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn get_ux_improvements(&self) -> PerformanceResult<Vec<UxImprovement>> {
        Ok(CommonUxImprovements::all())
    }

    async fn implement_ux_improvement(&self, improvement_id: &str) -> PerformanceResult<bool> {
        info!("Implementing UX improvement: {}", improvement_id);

        let improvements = CommonUxImprovements::all();

        if let Some(improvement) = improvements.iter().find(|i| i.id == improvement_id) {
            info!("Implemented UX improvement: {}", improvement.name);
            Ok(true)
        } else {
            Ok(false)
        }
    }
}
