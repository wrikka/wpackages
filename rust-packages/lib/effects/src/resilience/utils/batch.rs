use crate::resilience::error::Result;
use crate::resilience::types::{BatchItem, BatchResult};
use std::time::Instant;

pub fn calculate_batch_stats(total_items: usize, batch_count: usize) -> f64 {
    if batch_count == 0 {
        0.0
    } else {
        total_items as f64 / batch_count as f64
    }
}

pub fn create_batch_result<T>(
    items: Vec<T>,
    processed_count: usize,
    failed_count: usize,
    start_time: Instant,
) -> BatchResult<T> {
    let duration_ms = start_time.elapsed().as_millis() as u64;

    BatchResult {
        items,
        processed_count,
        failed_count,
        duration_ms,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_batch_stats() {
        assert_eq!(calculate_batch_stats(100, 10), 10.0);
        assert_eq!(calculate_batch_stats(0, 0), 0.0);
    }
}
