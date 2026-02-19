use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{timeout, Duration};

/// Timeout configuration for effect execution
#[derive(Debug, Clone, Copy)]
pub struct TimeoutConfig {
    pub duration: Duration,
    pub enable_cancellation: bool,
}

impl TimeoutConfig {
    pub fn new(duration: Duration) -> Self {
        Self {
            duration,
            enable_cancellation: true,
        }
    }

    pub fn without_cancellation(mut self) -> Self {
        self.enable_cancellation = false;
        self
    }
}

impl From<Duration> for TimeoutConfig {
    fn from(duration: Duration) -> Self {
        Self::new(duration)
    }
}

/// Timeout extension trait for effects
pub trait TimeoutExt<T, E, R> {
    /// Apply timeout to effect execution
    fn with_timeout(self, config: impl Into<TimeoutConfig>) -> Effect<T, E, R>;

    /// Apply timeout with simple duration
    fn timeout(self, duration: Duration) -> Effect<T, E, R>;
}

impl<T, E, R> TimeoutExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_timeout(self, config: impl Into<TimeoutConfig>) -> Effect<T, E, R> {
        let config = config.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();

            Box::pin(async move {
                match timeout(config.duration, effect.run(ctx)).await {
                    Ok(result) => result,
                    Err(_) => Err(EffectError::EffectFailed(format!(
                        "Effect timed out after {:?}",
                        config.duration
                    ))
                    .into()),
                }
            })
        })
    }

    fn timeout(self, duration: Duration) -> Effect<T, E, R> {
        self.with_timeout(duration)
    }
}

/// Cancellation token support for graceful shutdown
#[derive(Debug, Clone)]
pub struct CancellationToken {
    inner: Arc<Mutex<bool>>,
    notify: Arc<tokio::sync::Notify>,
}

impl CancellationToken {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(false)),
            notify: Arc::new(tokio::sync::Notify::new()),
        }
    }

    pub async fn cancel(&self) {
        let mut guard = self.inner.lock().await;
        *guard = true;
        self.notify.notify_waiters();
    }

    pub async fn is_cancelled(&self) -> bool {
        *self.inner.lock().await
    }

    pub async fn cancelled(&self) {
        let inner = self.inner.clone();
        let notify = self.notify.clone();

        loop {
            if *inner.lock().await {
                return;
            }
            notify.notified().await;
        }
    }
}

impl Default for CancellationToken {
    fn default() -> Self {
        Self::new()
    }
}

/// Cancellable effect extension
pub trait CancellableExt<T, E, R> {
    /// Make effect cancellable with a token
    fn with_cancellation(self, token: CancellationToken) -> Effect<T, E, R>;

    /// Race effect against cancellation
    fn race_cancellation(self, token: CancellationToken) -> Effect<T, E, R>;
}

impl<T, E, R> CancellableExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_cancellation(self, token: CancellationToken) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let token = token.clone();

            Box::pin(async move {
                tokio::select! {
                    result = effect.run(ctx) => result,
                    _ = token.cancelled() => {
                        Err(EffectError::EffectFailed("Effect was cancelled".to_string()).into())
                    }
                }
            })
        })
    }

    fn race_cancellation(self, token: CancellationToken) -> Effect<T, E, R> {
        self.with_cancellation(token)
    }
}

/// Deadline-based timeout (absolute time instead of duration)
pub trait DeadlineExt<T, E, R> {
    /// Apply deadline to effect execution
    fn with_deadline(self, deadline: std::time::Instant) -> Effect<T, E, R>;
}

impl<T, E, R> DeadlineExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_deadline(self, deadline: std::time::Instant) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();

            Box::pin(async move {
                let now = std::time::Instant::now();
                if now >= deadline {
                    return Err(EffectError::EffectFailed("Deadline already passed".to_string()).into());
                }

                let duration = deadline - now;
                match timeout(duration, effect.run(ctx)).await {
                    Ok(result) => result,
                    Err(_) => Err(EffectError::EffectFailed(format!(
                        "Effect missed deadline at {:?}",
                        deadline
                    ))
                    .into()),
                }
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_timeout_success() {
        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(Duration::from_millis(10)).await;
                Ok(42)
            })
        })
        .timeout(Duration::from_millis(100));

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_timeout_failure() {
        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(Duration::from_millis(200)).await;
                Ok(42)
            })
        })
        .timeout(Duration::from_millis(50));

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("timed out"));
    }

    #[tokio::test]
    async fn test_cancellation() {
        let token = CancellationToken::new();
        let token_clone = token.clone();

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(Duration::from_secs(10)).await;
                Ok(42)
            })
        })
        .with_cancellation(token_clone);

        // Cancel after 50ms
        tokio::spawn(async move {
            tokio::time::sleep(Duration::from_millis(50)).await;
            token.cancel().await;
        });

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("cancelled"));
    }

    #[tokio::test]
    async fn test_deadline() {
        let deadline = std::time::Instant::now() + Duration::from_millis(100);

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(Duration::from_millis(50)).await;
                Ok(42)
            })
        })
        .with_deadline(deadline);

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_deadline_missed() {
        let deadline = std::time::Instant::now() - Duration::from_millis(100);

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move { Ok(42) })
        })
        .with_deadline(deadline);

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Deadline already passed"));
    }
}
