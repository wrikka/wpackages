//! Performance configuration types

use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Performance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    pub enable_profiling: bool,
    pub profile_interval: Duration,
    pub enable_optimizations: bool,
    pub auto_optimize: bool,
    pub enable_metrics: bool,
    pub metrics_retention: Duration,
}

impl PerformanceConfig {
    pub fn new() -> Self {
        Self {
            enable_profiling: true,
            profile_interval: Duration::from_secs(1),
            enable_optimizations: true,
            auto_optimize: false,
            enable_metrics: true,
            metrics_retention: Duration::from_secs(3600),
        }
    }

    pub fn with_profiling(mut self, enable: bool) -> Self {
        self.enable_profiling = enable;
        self
    }

    pub fn with_profile_interval(mut self, interval: Duration) -> Self {
        self.profile_interval = interval;
        self
    }

    pub fn with_optimizations(mut self, enable: bool) -> Self {
        self.enable_optimizations = enable;
        self
    }

    pub fn with_auto_optimize(mut self, enable: bool) -> Self {
        self.auto_optimize = enable;
        self
    }

    pub fn with_metrics(mut self, enable: bool) -> Self {
        self.enable_metrics = enable;
        self
    }

    pub fn with_metrics_retention(mut self, retention: Duration) -> Self {
        self.metrics_retention = retention;
        self
    }
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self::new()
    }
}
