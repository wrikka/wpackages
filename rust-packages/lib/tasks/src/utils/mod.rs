//! Utility functions for task management
//!
//! Provides time measurement, hashing, random generation, string manipulation,
//! time calculations, and async utilities.

pub mod async_utils;
pub mod hash;
pub mod random;
pub mod string;
pub mod time;

pub use async_utils::*;
pub use hash::*;
pub use random::*;
pub use string::*;
pub use time::*;

use std::time::{Duration, Instant};

/// Measure the duration of a function execution
pub fn measure_duration<F, R>(f: F) -> (R, Duration)
where
    F: FnOnce() -> R,
{
    let start = Instant::now();
    let result = f();
    let duration = start.elapsed();
    (result, duration)
}

/// Measure the duration of an async function execution
pub async fn measure_async_duration<F, R, Fut>(f: F) -> (R, Duration)
where
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = R>,
{
    let start = Instant::now();
    let result = f().await;
    let duration = start.elapsed();
    (result, duration)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_measure_duration() {
        let (result, duration) = measure_duration(|| {
            std::thread::sleep(Duration::from_millis(100));
            42
        });
        assert_eq!(result, 42);
        assert!(duration >= Duration::from_millis(100));
    }

    #[tokio::test]
    async fn test_measure_async_duration() {
        let (result, duration) = measure_async_duration(|| async {
            tokio::time::sleep(Duration::from_millis(100)).await;
            42
        })
        .await;
        assert_eq!(result, 42);
        assert!(duration >= Duration::from_millis(100));
    }
}
