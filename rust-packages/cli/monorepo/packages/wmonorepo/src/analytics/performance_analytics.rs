// Performance analytics

pub struct PerformanceAnalytics;

impl PerformanceAnalytics {
    pub fn analyze_performance(duration_ms: u64) -> PerformanceReport {
        PerformanceReport {
            duration_ms,
            is_fast: duration_ms < 1000,
            is_slow: duration_ms > 10000,
        }
    }
}

#[derive(Debug, Clone)]
pub struct PerformanceReport {
    pub duration_ms: u64,
    pub is_fast: bool,
    pub is_slow: bool,
}
