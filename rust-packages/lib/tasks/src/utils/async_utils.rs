//! Async utilities for task system
//!
//! Provides timeout handling and retry logic for async operations.

use std::future::Future;
use std::time::Duration;

/// Run a future with a timeout
pub async fn with_timeout<T>(
    duration: Duration,
    future: impl Future<Output = T>,
) -> Option<T> {
    tokio::time::timeout(duration, future).await.ok()
}

/// Run a future with a timeout, returning a default on timeout
pub async fn with_timeout_or<T>(
    duration: Duration,
    future: impl Future<Output = T>,
    default: T,
) -> T {
    tokio::time::timeout(duration, future).await.unwrap_or(default)
}

/// Retry a future with exponential backoff
pub async fn retry_with_backoff<T, E, F, Fut>(
    max_retries: u32,
    initial_delay: Duration,
    f: F,
) -> Result<T, E>
where
    F: Fn() -> Fut,
    Fut: Future<Output = Result<T, E>>,
{
    let mut delay = initial_delay;
    let mut retries = 0;

    loop {
        match f().await {
            Ok(result) => return Ok(result),
            Err(e) => {
                retries += 1;
                if retries >= max_retries {
                    return Err(e);
                }
                tokio::time::sleep(delay).await;
                delay *= 2;
            }
        }
    }
}

/// Retry with jitter to prevent thundering herd
pub async fn retry_with_jitter<T, E, F, Fut>(
    max_retries: u32,
    base_delay: Duration,
    jitter_ms: u64,
    f: F,
) -> Result<T, E>
where
    F: Fn() -> Fut,
    Fut: Future<Output = Result<T, E>>,
{
    let mut delay_ms = base_delay.as_millis() as u64;
    let mut retries = 0;

    loop {
        match f().await {
            Ok(result) => return Ok(result),
            Err(e) => {
                retries += 1;
                if retries >= max_retries {
                    return Err(e);
                }

                // Add jitter
                let jitter = if jitter_ms > 0 {
                    crate::utils::random::random_range(0, jitter_ms as usize) as u64
                } else {
                    0
                };

                tokio::time::sleep(Duration::from_millis(delay_ms + jitter)).await;
                delay_ms *= 2;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_with_timeout() {
        let result = with_timeout(Duration::from_millis(100), async {
            tokio::time::sleep(Duration::from_millis(50)).await;
            "success"
        })
        .await;
        assert_eq!(result, Some("success"));

        let result = with_timeout(Duration::from_millis(10), async {
            tokio::time::sleep(Duration::from_millis(50)).await;
            "success"
        })
        .await;
        assert_eq!(result, None);
    }

    #[tokio::test]
    async fn test_retry_with_backoff_success() {
        let mut attempts = 0;
        let result = retry_with_backoff(
            3,
            Duration::from_millis(10),
            || async {
                attempts += 1;
                if attempts < 2 {
                    Err("not yet")
                } else {
                    Ok("success")
                }
            },
        )
        .await;

        assert_eq!(result, Ok("success"));
        assert_eq!(attempts, 2);
    }
}
