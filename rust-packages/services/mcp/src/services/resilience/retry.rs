use std::time::Duration;
use tokio::time::sleep;
use tracing::{debug, warn};

#[derive(Debug, Clone, Copy)]
pub enum BackoffStrategy {
    Fixed,
    Linear,
    Exponential,
}

#[derive(Debug, Clone)]
pub struct RetryConfig {
    pub max_attempts: usize,
    pub initial_delay: Duration,
    pub max_delay: Duration,
    pub backoff_strategy: BackoffStrategy,
    pub jitter: bool,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_delay: Duration::from_millis(100),
            max_delay: Duration::from_secs(10),
            backoff_strategy: BackoffStrategy::Exponential,
            jitter: true,
        }
    }
}

pub struct RetryPolicy {
    config: RetryConfig,
}

impl RetryPolicy {
    pub fn new(config: RetryConfig) -> Self {
        Self { config }
    }

    pub async fn call<F, T, E>(&self, mut f: F) -> Result<T, E>
    where
        F: FnMut() -> Result<T, E>,
        E: std::error::Error,
    {
        let mut attempt = 0;
        let mut delay = self.config.initial_delay;

        loop {
            attempt += 1;

            match f() {
                Ok(value) => {
                    if attempt > 1 {
                        debug!("Operation succeeded after {} attempts", attempt);
                    }
                    return Ok(value);
                }
                Err(error) if attempt >= self.config.max_attempts => {
                    warn!("Operation failed after {} attempts: {}", attempt, error);
                    return Err(error);
                }
                Err(error) => {
                    debug!(
                        "Attempt {} failed: {}, retrying in {:?}",
                        attempt, error, delay
                    );
                    sleep(delay).await;

                    delay = self.calculate_delay(attempt);
                }
            }
        }
    }

    fn calculate_delay(&self, attempt: usize) -> Duration {
        let delay = match self.config.backoff_strategy {
            BackoffStrategy::Fixed => self.config.initial_delay,
            BackoffStrategy::Linear => {
                self.config.initial_delay * attempt as u32
            }
            BackoffStrategy::Exponential => {
                self.config.initial_delay * 2u32.pow((attempt - 1) as u32)
            }
        };

        let delay = delay.min(self.config.max_delay);

        if self.config.jitter {
            let jitter_ms = (delay.as_millis() as f64 * 0.1) as u64;
            let jitter = Duration::from_millis(
                rand::random::<u64>() % (jitter_ms * 2 + 1)
            );
            delay.saturating_add(jitter).saturating_sub(jitter)
        } else {
            delay
        }
    }
}
