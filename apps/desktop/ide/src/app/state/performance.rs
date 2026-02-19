use crate::types::performance::{PerformanceClient, PerformanceConfig, PerformanceReport};

#[derive(Debug, Clone, Default)]
pub struct PerformanceState {
    pub client: PerformanceClient,
    pub config: PerformanceConfig,
    pub last_report: Option<PerformanceReport>,
    pub profiling: bool,
}

impl PerformanceState {
    pub fn new() -> Self {
        Self {
            client: PerformanceClient::new(),
            config: PerformanceConfig::new(),
            last_report: None,
            profiling: false,
        }
    }

    pub fn with_client(mut self, client: PerformanceClient) -> Self {
        self.client = client;
        self
    }

    pub fn with_config(mut self, config: PerformanceConfig) -> Self {
        self.config = config;
        self
    }

    pub fn with_last_report(mut self, report: PerformanceReport) -> Self {
        self.last_report = Some(report);
        self
    }

    pub fn with_profiling(mut self, profiling: bool) -> Self {
        self.profiling = profiling;
        self
    }

    pub fn set_config(&mut self, config: PerformanceConfig) {
        self.config = config;
    }

    pub fn set_last_report(&mut self, report: PerformanceReport) {
        self.last_report = Some(report);
    }

    pub fn set_profiling(&mut self, profiling: bool) {
        self.profiling = profiling;
    }

    pub fn is_profiling(&self) -> bool {
        self.profiling
    }

    pub fn get_avg_memory_usage(&self) -> f64 {
        if let Some(report) = &self.last_report {
            report.metrics_summary.avg_memory_usage
        } else {
            0.0
        }
    }

    pub fn get_avg_cpu_usage(&self) -> f64 {
        if let Some(report) = &self.last_report {
            report.metrics_summary.avg_cpu_usage
        } else {
            0.0
        }
    }
}
