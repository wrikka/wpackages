//! Time utilities

use std::time::{Duration, Instant};

/// Format duration as human-readable string
pub fn format_duration(duration: Duration) -> String {
    let ms = duration.as_millis();
    if ms < 1000 {
        format!("{}ms", ms)
    } else if ms < 60000 {
        format!("{:.2}s", ms as f64 / 1000.0)
    } else {
        let mins = ms / 60000;
        let secs = (ms % 60000) / 1000;
        format!("{}m {}s", mins, secs)
    }
}

/// Calculate elapsed time since instant
pub fn elapsed_since(instant: Instant) -> Duration {
    instant.elapsed()
}

/// Create duration from milliseconds
pub const fn duration_millis(ms: u64) -> Duration {
    Duration::from_millis(ms)
}

/// Create duration from seconds
pub const fn duration_secs(secs: u64) -> Duration {
    Duration::from_secs(secs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_duration() {
        assert_eq!(format_duration(Duration::from_millis(100)), "100ms");
        assert_eq!(format_duration(Duration::from_millis(1500)), "1.50s");
        assert_eq!(format_duration(Duration::from_secs(90)), "1m 30s");
    }
}
