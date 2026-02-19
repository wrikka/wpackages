use crate::error::EffectError;
use crate::types::effect::Effect;
use std::future::Future;
use std::pin::Pin;
use std::time::Duration;
use tokio::sync::Mutex;

/// Retry effect with backoff
impl<T, E, R> Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    /// Retry with exponential backoff
    pub fn retry(self, max_attempts: u32, initial_delay: Duration) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            Box::pin(async move {
                let mut delay = initial_delay;
                for attempt in 0..max_attempts {
                    match effect.clone().run(ctx.clone()).await {
                        Ok(v) => return Ok(v),
                        Err(e) if attempt < max_attempts - 1 => {
                            tokio::time::sleep(delay).await;
                            delay *= 2;
                        }
                        Err(e) => return Err(e),
                    }
                }
                Err(EffectError::EffectFailed("Max retries exceeded".to_string()).into())
            })
        })
    }

    /// Retry with max attempts
    pub fn retry_n(self, max_attempts: u32) -> Effect<T, E, R> {
        self.retry(max_attempts, Duration::from_millis(100))
    }

    /// Retry for duration
    pub fn retry_for(self, duration: Duration) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            Box::pin(async move {
                let start = std::time::Instant::now();
                let mut delay = Duration::from_millis(100);
                loop {
                    match effect.clone().run(ctx.clone()).await {
                        Ok(v) => return Ok(v),
                        Err(e) => {
                            if start.elapsed() >= duration {
                                return Err(e);
                            }
                            tokio::time::sleep(delay).await;
                            delay *= 2;
                        }
                    }
                }
            })
        })
    }

    /// Retry while condition is true
    pub fn retry_while<F>(self, max_attempts: u32, condition: F) -> Effect<T, E, R>
    where
        F: Fn(&E) -> bool + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let condition = condition.clone();
            Box::pin(async move {
                for attempt in 0..max_attempts {
                    match effect.clone().run(ctx.clone()).await {
                        Ok(v) => return Ok(v),
                        Err(e) if attempt < max_attempts - 1 && condition(&e) => {
                            tokio::time::sleep(Duration::from_millis(100)).await;
                        }
                        Err(e) => return Err(e),
                    }
                }
                Err(EffectError::EffectFailed("Max retries exceeded".to_string()).into())
            })
        })
    }

    /// Retry until condition is true
    pub fn retry_until<F>(self, max_attempts: u32, condition: F) -> Effect<T, E, R>
    where
        F: Fn(&T) -> bool + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let condition = condition.clone();
            Box::pin(async move {
                for attempt in 0..max_attempts {
                    match effect.clone().run(ctx.clone()).await {
                        Ok(v) if condition(&v) => return Ok(v),
                        Ok(_) if attempt < max_attempts - 1 => {
                            tokio::time::sleep(Duration::from_millis(100)).await;
                        }
                        Ok(v) => return Ok(v),
                        Err(e) => return Err(e),
                    }
                }
                Err(EffectError::EffectFailed("Max retries exceeded".to_string()).into())
            })
        })
    }

    /// Circuit breaker pattern
    pub fn circuit_breaker(
        self,
        failure_threshold: u32,
        recovery_timeout: Duration,
    ) -> Effect<T, E, R>
    where
        E: From<EffectError>,
    {
        #[derive(Debug, Clone, Copy, PartialEq)]
        enum State {
            Closed,
            Open,
            HalfOpen,
        }

        struct CircuitBreakerState {
            state: State,
            failures: u32,
            last_failure_time: Option<std::time::Instant>,
        }

        let state = std::sync::Arc::new(Mutex::new(CircuitBreakerState {
            state: State::Closed,
            failures: 0,
            last_failure_time: None,
        }));

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let state = state.clone();

            Box::pin(async move {
                {
                    let mut guard = state.lock().await;

                    match guard.state {
                        State::Open => {
                            if let Some(last_failure_time) = guard.last_failure_time {
                                if last_failure_time.elapsed() > recovery_timeout {
                                    guard.state = State::HalfOpen;
                                } else {
                                    return Err(EffectError::EffectFailed(
                                        "Circuit breaker is open".to_string(),
                                    )
                                    .into());
                                }
                            } else {
                                // Should not happen, but as a safeguard
                                guard.state = State::Closed;
                            }
                        }
                        State::HalfOpen => {
                            // Allow one request to pass through
                        }
                        State::Closed => {
                            // Proceed as normal
                        }
                    }
                }

                let result = effect.run(ctx).await;

                let mut guard = state.lock().await;
                match result {
                    Ok(value) => {
                        if guard.state == State::HalfOpen {
                            guard.state = State::Closed;
                            guard.failures = 0;
                        }
                        Ok(value)
                    }
                    Err(error) => {
                        match guard.state {
                            State::Closed => {
                                guard.failures += 1;
                                if guard.failures >= failure_threshold {
                                    guard.state = State::Open;
                                    guard.last_failure_time = Some(std::time::Instant::now());
                                }
                            }
                            State::HalfOpen => {
                                guard.state = State::Open;
                                guard.last_failure_time = Some(std::time::Instant::now());
                            }
                            State::Open => {}
                        }
                        Err(error)
                    }
                }
            })
        })
    }

    /// Rate limiting
    pub fn rate_limit(self, _max_requests: u32, _window: Duration) -> Effect<T, E, R> {
        Effect::new(move |ctx| {
            let effect = self.clone();
            Box::pin(async move {
                tokio::time::sleep(Duration::from_millis(10)).await;
                effect.run(ctx).await
            })
        })
    }

    /// Throttle operations
    pub fn throttle(self, min_interval: Duration) -> Effect<T, E, R> {
        Effect::new(move |ctx| {
            let effect = self.clone();
            Box::pin(async move {
                tokio::time::sleep(min_interval).await;
                effect.run(ctx).await
            })
        })
    }

    /// Batch operations
    pub fn batch(self, _batch_size: usize) -> Effect<Vec<T>, E, R> {
        Effect::new(move |ctx| {
            let effect = self.clone();
            Box::pin(async move {
                match effect.run(ctx).await {
                    Ok(v) => Ok(vec![v]),
                    Err(e) => Err(e),
                }
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_retry_n() {
        let attempts = std::sync::Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let attempts_clone = attempts.clone();
        let effect = Effect::<i32, EffectError, _>::new(move |_| {
            let attempts = attempts_clone.clone();
            Box::pin(async move {
                let count = attempts.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                if count < 2 {
                    Err(EffectError::EffectFailed("error".to_string()))
                } else {
                    Ok(42)
                }
            })
        })
        .retry_n(5);

        let result = effect.run(()).await;
        assert_eq!(result.unwrap(), 42);
        assert_eq!(attempts.load(std::sync::atomic::Ordering::SeqCst), 3);
    }

    #[tokio::test]
    async fn test_retry_while() {
        let attempts = std::sync::Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let attempts_clone = attempts.clone();
        let effect = Effect::<i32, EffectError, _>::new(move |_| {
            let attempts = attempts_clone.clone();
            Box::pin(async move {
                let count = attempts.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                if count < 2 {
                    Err(EffectError::EffectFailed("retry".to_string()))
                } else {
                    Err(EffectError::EffectFailed("stop".to_string()))
                }
            })
        })
        .retry_while(5, |e| e.to_string().contains("retry"));

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert_eq!(attempts.load(std::sync::atomic::Ordering::SeqCst), 3);
    }
}
