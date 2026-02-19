#[derive(Debug, Clone, Default)]
pub struct ModelMetrics {
    pub total_requests: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub total_tokens: u64,
    pub total_inference_time_ms: u64,
}
