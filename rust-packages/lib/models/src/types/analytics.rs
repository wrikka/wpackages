use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Represents a single log entry for an API call.
#[deriveDebug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: u64,
    pub provider: String,
    pub model: String,
    pub request_type: String,
    pub latency: Duration,
    pub tokens_used: Option<(u32, u32)>,
    pub cost: Option<f64>,
    pub is_error: bool,
    pub error_message: Option<String>,
}

/// Represents aggregated metrics.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Metrics {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub total_latency: Duration,
    pub total_input_tokens: u64,
    pub total_output_tokens: u64,
    pub total_cost: f64,
}
