#[derive(Debug, Clone, Default)]
pub struct PerformanceClient {
    pub snapshots: Vec<PerformanceSnapshot>,
}

impl PerformanceClient {
    pub fn new() -> Self {
        Self {
            snapshots: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct PerformanceSnapshot {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub memory_usage: MemoryUsage,
    pub cpu_usage: CpuUsage,
}

#[derive(Debug, Clone)]
pub struct MemoryUsage {
    pub total: u64,
    pub used: u64,
    pub free: u64,
}

#[derive(Debug, Clone)]
pub struct CpuUsage {
    pub user: f64,
    pub system: f64,
    pub idle: f64,
}

#[derive(Debug, Clone)]
pub struct PerformanceConfig {
    pub enable_profiling: bool,
    pub profile_interval: std::time::Duration,
    pub enable_optimizations: bool,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            enable_profiling: true,
            profile_interval: std::time::Duration::from_secs(1),
            enable_optimizations: true,
        }
    }
}

#[derive(Debug, Clone)]
pub struct PerformanceReport {
    pub id: String,
    pub name: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub duration: std::time::Duration,
    pub metrics_summary: MetricsSummary,
}

#[derive(Debug, Clone)]
pub struct MetricsSummary {
    pub avg_memory_usage: f64,
    pub avg_cpu_usage: f64,
    pub peak_memory: u64,
    pub peak_cpu: f64,
}
