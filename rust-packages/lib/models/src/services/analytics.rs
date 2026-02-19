use crate::types::{LogEntry, Metrics};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime};

/// A service for collecting and storing analytics data.
#[derive(Debug, Clone, Default)]
pub struct AnalyticsService {
    logs: Arc<Mutex<Vec<LogEntry>>>,
    metrics: Arc<Mutex<Metrics>>,
}

impl AnalyticsService {
    /// Create a new `AnalyticsService`.
    pub fn new() -> Self {
        Self::default()
    }

    /// Log a new API call entry.
    pub fn log(&self, entry: LogEntry) {
        let mut logs = self.logs.lock().unwrap();
        let mut metrics = self.metrics.lock().unwrap();

        // Update metrics
        metrics.total_requests += 1;
        if entry.is_error {
            metrics.failed_requests += 1;
        } else {
            metrics.successful_requests += 1;
        }
        metrics.total_latency += entry.latency;
        if let Some((input, output)) = entry.tokens_used {
            metrics.total_input_tokens += input as u64;
            metrics.total_output_tokens += output as u64;
        }
        if let Some(cost) = entry.cost {
            metrics.total_cost += cost;
        }

        logs.push(entry);
    }

    /// Get all collected logs.
    pub fn get_logs(&self) -> Vec<LogEntry> {
        self.logs.lock().unwrap().clone()
    }

    /// Get the current aggregated metrics.
    pub fn get_metrics(&self) -> Metrics {
        self.metrics.lock().unwrap().clone()
    }
}
