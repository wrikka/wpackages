//! Pure time utility functions

use chrono::{DateTime, Utc, Duration};
use std::time::Instant;

/// Format duration in milliseconds to human readable string
pub fn format_duration_ms(duration_ms: u64) -> String {
    if duration_ms < 1000 {
        format!("{}ms", duration_ms)
    } else if duration_ms < 60_000 {
        format!("{:.1}s", duration_ms as f64 / 1000.0)
    } else if duration_ms < 3_600_000 {
        let minutes = duration_ms / 60_000;
        let seconds = (duration_ms % 60_000) / 1000;
        format!("{}m{}s", minutes, seconds)
    } else {
        let hours = duration_ms / 3_600_000;
        let minutes = (duration_ms % 3_600_000) / 60_000;
        format!("{}h{}m", hours, minutes)
    }
}

/// Calculate duration between two DateTime<Utc> in milliseconds
pub fn duration_between_ms(start: DateTime<Utc>, end: DateTime<Utc>) -> u64 {
    (end - start).num_milliseconds().max(0) as u64
}

/// Check if a duration is within acceptable range
pub fn is_within_timeout(start_time: Instant, timeout_ms: u64) -> bool {
    start_time.elapsed().as_millis() as u64 <= timeout_ms
}

/// Calculate average duration from a list of durations
pub fn average_duration_ms(durations: &[u64]) -> f64 {
    if durations.is_empty() {
        return 0.0;
    }
    durations.iter().sum::<u64>() as f64 / durations.len() as f64
}

/// Calculate median duration from a list of durations
pub fn median_duration_ms(durations: &mut [u64]) -> f64 {
    if durations.is_empty() {
        return 0.0;
    }
    
    durations.sort();
    let len = durations.len();
    
    if len % 2 == 0 {
        (durations[len / 2 - 1] + durations[len / 2]) as f64 / 2.0
    } else {
        durations[len / 2] as f64
    }
}

/// Calculate percentile of durations
pub fn percentile_duration_ms(durations: &mut [u64], percentile: f64) -> f64 {
    if durations.is_empty() {
        return 0.0;
    }
    
    if percentile <= 0.0 {
        return durations[0] as f64;
    }
    if percentile >= 100.0 {
        return *durations.last().unwrap() as f64;
    }
    
    durations.sort();
    let index = ((percentile / 100.0) * (durations.len() - 1) as f64) as usize;
    durations[index] as f64
}

/// Get current timestamp in milliseconds
pub fn current_timestamp_ms() -> u64 {
    Utc::now().timestamp_millis() as u64
}

/// Convert DateTime<Utc> to timestamp in milliseconds
pub fn datetime_to_timestamp_ms(dt: DateTime<Utc>) -> u64 {
    dt.timestamp_millis() as u64
}

/// Convert timestamp in milliseconds to DateTime<Utc>
pub fn timestamp_ms_to_datetime(timestamp_ms: u64) -> DateTime<Utc> {
    DateTime::from_timestamp(timestamp_ms as i64 / 1000, (timestamp_ms % 1000) as u32 * 1_000_000)
        .unwrap_or(Utc::now())
}

/// Add duration to DateTime<Utc>
pub fn add_duration_to_datetime(dt: DateTime<Utc>, duration_ms: u64) -> DateTime<Utc> {
    dt + Duration::milliseconds(duration_ms as i64)
}

/// Check if DateTime<Utc> is in the past
pub fn is_in_past(dt: DateTime<Utc>) -> bool {
    dt < Utc::now()
}

/// Check if DateTime<Utc> is in the future
pub fn is_in_future(dt: DateTime<Utc>) -> bool {
    dt > Utc::now()
}

/// Format DateTime<Utc> as ISO 8601 string
pub fn format_datetime_iso(dt: DateTime<Utc>) -> String {
    dt.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()
}

/// Parse ISO 8601 string to DateTime<Utc>
pub fn parse_datetime_iso(s: &str) -> Result<DateTime<Utc>, chrono::ParseError> {
    DateTime::parse_from_rfc3339(s).map(|dt| dt.with_timezone(&Utc))
}

/// Calculate time remaining until a future DateTime<Utc>
pub fn time_remaining_ms(future_dt: DateTime<Utc>) -> u64 {
    let now = Utc::now();
    if future_dt <= now {
        0
    } else {
        (future_dt - now).num_milliseconds().max(0) as u64
    }
}

/// Check if a timeout has expired
pub fn is_timeout_expired(start_dt: DateTime<Utc>, timeout_ms: u64) -> bool {
    let elapsed = duration_between_ms(start_dt, Utc::now());
    elapsed > timeout_ms
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn test_format_duration_ms() {
        assert_eq!(format_duration_ms(500), "500ms");
        assert_eq!(format_duration_ms(1500), "1.5s");
        assert_eq!(format_duration_ms(90_000), "1m30s");
        assert_eq!(format_duration_ms(3_600_000), "1h0m");
    }

    #[test]
    fn test_duration_between_ms() {
        let start = Utc.with_ymd_and_hms(2023, 1, 1, 12, 0, 0).unwrap();
        let end = Utc.with_ymd_and_hms(2023, 1, 1, 12, 0, 5).unwrap();
        assert_eq!(duration_between_ms(start, end), 5000);
    }

    #[test]
    fn test_is_within_timeout() {
        let start = Instant::now();
        assert!(is_within_timeout(start, 1000));
        
        // This should pass even if it takes a few milliseconds
        assert!(is_within_timeout(start, 10));
    }

    #[test]
    fn test_average_duration_ms() {
        assert_eq!(average_duration_ms(&[]), 0.0);
        assert_eq!(average_duration_ms(&[100, 200, 300]), 200.0);
    }

    #[test]
    fn test_median_duration_ms() {
        let mut empty = [];
        assert_eq!(median_duration_ms(&mut empty), 0.0);
        
        let mut odd = [100, 200, 300];
        assert_eq!(median_duration_ms(&mut odd), 200.0);
        
        let mut even = [100, 200, 300, 400];
        assert_eq!(median_duration_ms(&mut even), 250.0);
    }

    #[test]
    fn test_percentile_duration_ms() {
        let mut durations = [100, 200, 300, 400, 500];
        assert_eq!(percentile_duration_ms(&mut durations, 0.0), 100.0);
        assert_eq!(percentile_duration_ms(&mut durations, 50.0), 300.0);
        assert_eq!(percentile_duration_ms(&mut durations, 100.0), 500.0);
    }

    #[test]
    fn test_current_timestamp_ms() {
        let ts1 = current_timestamp_ms();
        std::thread::sleep(std::time::Duration::from_millis(1));
        let ts2 = current_timestamp_ms();
        assert!(ts2 > ts1);
    }

    #[test]
    fn test_datetime_conversions() {
        let dt = Utc.with_ymd_and_hms(2023, 1, 1, 12, 0, 0).unwrap();
        let timestamp = datetime_to_timestamp_ms(dt);
        let converted_back = timestamp_ms_to_datetime(timestamp);
        assert_eq!(dt, converted_back);
    }

    #[test]
    fn test_format_datetime_iso() {
        let dt = Utc.with_ymd_and_hms(2023, 1, 1, 12, 0, 0).unwrap();
        let iso = format_datetime_iso(dt);
        assert!(iso.starts_with("2023-01-01T12:00:00"));
        assert!(iso.ends_with("Z"));
    }

    #[test]
    fn test_parse_datetime_iso() {
        let iso = "2023-01-01T12:00:00.000Z";
        let dt = parse_datetime_iso(iso).unwrap();
        assert_eq!(dt.year(), 2023);
        assert_eq!(dt.month(), 1);
        assert_eq!(dt.day(), 1);
        assert_eq!(dt.hour(), 12);
    }

    #[test]
    fn test_is_in_past_future() {
        let past = Utc::now() - chrono::Duration::hours(1);
        let future = Utc::now() + chrono::Duration::hours(1);
        
        assert!(is_in_past(past));
        assert!(!is_in_future(past));
        assert!(!is_in_past(future));
        assert!(is_in_future(future));
    }

    #[test]
    fn test_time_remaining_ms() {
        let future = Utc::now() + chrono::Duration::seconds(10);
        let remaining = time_remaining_ms(future);
        assert!(remaining > 9000 && remaining < 11000); // Allow some variance
        
        let past = Utc::now() - chrono::Duration::seconds(10);
        let remaining = time_remaining_ms(past);
        assert_eq!(remaining, 0);
    }
}
