// Usage analytics

pub struct UsageAnalytics;

impl UsageAnalytics {
    pub fn analyze_usage(task_count: usize) -> UsageReport {
        UsageReport {
            tasks_run: task_count,
            is_heavy_usage: task_count > 100,
        }
    }
}

#[derive(Debug, Clone)]
pub struct UsageReport {
    pub tasks_run: usize,
    pub is_heavy_usage: bool,
}
