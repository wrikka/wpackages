use std::time::{Duration, Instant};
use tokio::time::sleep;

#[derive(Debug, Clone)]
pub struct RateLimiter {
    min_delay_ms: u64,
    max_delay_ms: u64,
    current_delay_ms: u64,
    requests_per_second: f64,
    last_request_time: Option<Instant>,
    consecutive_errors: u32,
    consecutive_successes: u32,
}

#[derive(Debug, Clone)]
pub struct RetryStrategy {
    max_attempts: u32,
    base_delay_ms: u64,
    max_delay_ms: u64,
    backoff_multiplier: f64,
    jitter: bool,
}

impl RateLimiter {
    pub fn new(min_delay_ms: u64, max_delay_ms: u64) -> Self {
        Self {
            min_delay_ms,
            max_delay_ms,
            current_delay_ms: min_delay_ms,
            requests_per_second: 1000.0 / min_delay_ms as f64,
            last_request_time: None,
            consecutive_errors: 0,
            consecutive_successes: 0,
        }
    }

    pub async fn wait(&mut self) {
        if let Some(last) = self.last_request_time {
            let elapsed = last.elapsed().as_millis() as u64;
            if elapsed < self.current_delay_ms {
                sleep(Duration::from_millis(self.current_delay_ms - elapsed)).await;
            }
        }
        self.last_request_time = Some(Instant::now());
    }

    pub fn record_success(&mut self) {
        self.consecutive_successes += 1;
        self.consecutive_errors = 0;
        
        if self.consecutive_successes >= 5 {
            self.current_delay_ms = (self.current_delay_ms * 9 / 10).max(self.min_delay_ms);
            self.consecutive_successes = 0;
        }
    }

    pub fn record_error(&mut self) {
        self.consecutive_errors += 1;
        self.consecutive_successes = 0;
        
        let multiplier = 2u64.saturating_pow(self.consecutive_errors.min(5));
        self.current_delay_ms = (self.current_delay_ms * multiplier).min(self.max_delay_ms);
    }

    pub fn get_current_delay(&self) -> Duration {
        Duration::from_millis(self.current_delay_ms)
    }
}

impl RetryStrategy {
    pub fn new(max_attempts: u32, base_delay_ms: u64) -> Self {
        Self {
            max_attempts,
            base_delay_ms,
            max_delay_ms: 30000,
            backoff_multiplier: 2.0,
            jitter: true,
        }
    }

    pub async fn execute<F, Fut, T>(&self, mut operation: F) -> anyhow::Result<T>
    where
        F: FnMut() -> Fut,
        Fut: std::future::Future<Output = anyhow::Result<T>>,
    {
        let mut last_error = None;

        for attempt in 1..=self.max_attempts {
            match operation().await {
                Ok(result) => return Ok(result),
                Err(e) => {
                    last_error = Some(e);
                    
                    if attempt < self.max_attempts {
                        let delay = self.calculate_delay(attempt);
                        sleep(Duration::from_millis(delay)).await;
                    }
                }
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("All retry attempts failed")))
    }

    fn calculate_delay(&self, attempt: u32) -> u64 {
        let exponential = self.base_delay_ms as f64 * self.backoff_multiplier.powi(attempt as i32 - 1);
        let delay = exponential.min(self.max_delay_ms as f64) as u64;
        
        if self.jitter {
            let jitter = rand::random::<u64>() % (delay / 2);
            delay + jitter
        } else {
            delay
        }
    }
}
