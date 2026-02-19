use crate::types::StreamStats;

pub fn calculate_throughput(messages_consumed: u64, duration_ms: u64) -> f64 {
    if duration_ms == 0 {
        0.0
    } else {
        (messages_consumed as f64 / duration_ms as f64) * 1000.0
    }
}

pub fn create_stream_stats(
    messages_produced: u64,
    messages_consumed: u64,
    buffer_size: usize,
) -> StreamStats {
    StreamStats {
        messages_produced,
        messages_consumed,
        buffer_size,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_throughput() {
        assert_eq!(calculate_throughput(1000, 1000), 1000.0);
        assert_eq!(calculate_throughput(100, 1000), 100.0);
        assert_eq!(calculate_throughput(0, 1000), 0.0);
    }
}
