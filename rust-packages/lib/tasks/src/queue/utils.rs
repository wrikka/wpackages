//! Utility functions for queue management

use std::time::{Duration, Instant};

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
