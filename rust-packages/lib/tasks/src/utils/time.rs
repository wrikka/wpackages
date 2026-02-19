//! Time utilities for task system
//!
//! Provides common time manipulation and calculation functions.

use chrono::{DateTime, Duration, Utc};

/// Get current UTC timestamp
pub fn now() -> DateTime<Utc> {
    Utc::now()
}

/// Get timestamp N seconds from now
pub fn seconds_from_now(seconds: i64) -> DateTime<Utc> {
    now() + Duration::seconds(seconds)
}

/// Get timestamp N minutes from now
pub fn minutes_from_now(minutes: i64) -> DateTime<Utc> {
    now() + Duration::minutes(minutes)
}

/// Get timestamp N hours from now
pub fn hours_from_now(hours: i64) -> DateTime<Utc> {
    now() + Duration::hours(hours)
}

/// Get timestamp N days from now
pub fn days_from_now(days: i64) -> DateTime<Utc> {
    now() + Duration::days(days)
}

/// Check if a timestamp is in the past
pub fn is_past(dt: &DateTime<Utc>) -> bool {
    dt < &now()
}

/// Check if a timestamp is in the future
pub fn is_future(dt: &DateTime<Utc>) -> bool {
    dt > &now()
}

/// Duration since a timestamp (returns None if in future)
pub fn duration_since(dt: &DateTime<Utc>) -> Option<Duration> {
    let n = now();
    if dt > &n {
        None
    } else {
        Some(n - *dt)
    }
}

/// Format duration in human-readable format
pub fn format_duration(duration: &Duration) -> String {
    let secs = duration.num_seconds();
    if secs < 60 {
        format!("{}s", secs)
    } else if secs < 3600 {
        format!("{}m {}s", secs / 60, secs % 60)
    } else if secs < 86400 {
        format!("{}h {}m", secs / 3600, (secs % 3600) / 60)
    } else {
        format!("{}d {}h", secs / 86400, (secs % 86400) / 3600)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_seconds_from_now() {
        let future = seconds_from_now(60);
        assert!(is_future(&future));
    }

    #[test]
    fn test_format_duration() {
        assert_eq!(format_duration(&Duration::seconds(30)), "30s");
        assert_eq!(format_duration(&Duration::seconds(90)), "1m 30s");
        assert_eq!(format_duration(&Duration::seconds(3661)), "1h 1m");
        assert_eq!(format_duration(&Duration::seconds(90061)), "1d 1h");
    }
}
