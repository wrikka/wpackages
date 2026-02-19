use crate::error::{TestingError, TestingResult};
use crate::types::{BackoffStrategy, TestConfig, TestCase, TestExecutionResult, TestResult};
use std::time::{Duration, Instant};
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub struct RetryPolicy {
    pub max_retries: usize,
    pub backoff: BackoffStrategy,
    pub retry_on: Vec<RetryCondition>,
    pub jitter: bool,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_retries: 3,
            backoff: BackoffStrategy::Exponential {
                base_ms: 100,
                max_ms: 5000,
            },
            retry_on: vec![RetryCondition::Timeout, RetryCondition::Flaky],
            jitter: true,
        }
    }
}

impl RetryPolicy {
    pub fn new(max_retries: usize) -> Self {
        Self {
            max_retries,
            ..Default::default()
        }
    }

    pub fn with_backoff(mut self, backoff: BackoffStrategy) -> Self {
        self.backoff = backoff;
        self
    }

    pub fn with_retry_on(mut self, condition: RetryCondition) -> Self {
        self.retry_on.push(condition);
        self
    }

    pub fn with_jitter(mut self, jitter: bool) -> Self {
        self.jitter = jitter;
        self
    }

    pub fn should_retry(&self, result: &TestExecutionResult) -> bool {
        if result.retry_count >= self.max_retries {
            return false;
        }

        self.retry_on.iter().any(|condition| condition.matches(result))
    }

    pub fn next_delay(&self, retry_count: usize) -> Duration {
        let base_delay = self.backoff.delay(retry_count);

        if self.jitter {
            let jitter_range = base_delay.as_millis() as f64 * 0.1;
            let jitter = (rand_simple() % (jitter_range as u64 * 2)) as i64 - jitter_range as i64;
            let adjusted = base_delay.as_millis() as i64 + jitter;
            Duration::from_millis(adjusted.max(0) as u64)
        } else {
            base_delay
        }
    }

    pub fn from_config(config: &TestConfig) -> Self {
        Self {
            max_retries: if config.retry_flaky { config.max_retries } else { 0 },
            backoff: config.retry_backoff.clone(),
            retry_on: vec![RetryCondition::Timeout, RetryCondition::Flaky],
            jitter: true,
        }
    }
}

fn rand_simple() -> u64 {
    use std::collections::hash_map::RandomState;
    use std::hash::{BuildHasher, Hasher};
    let state = RandomState::new();
    let mut hasher = state.build_hasher();
    hasher.write_u64(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u64);
    hasher.finish()
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RetryCondition {
    Timeout,
    Flaky,
    Failure,
    Error,
    Always,
}

impl RetryCondition {
    pub fn matches(&self, result: &TestExecutionResult) -> bool {
        match self {
            Self::Timeout => result.result == TestResult::TimedOut,
            Self::Flaky => result.flaky_detected || result.was_retried(),
            Self::Failure => result.result == TestResult::Failed,
            Self::Error => result.result == TestResult::Error,
            Self::Always => true,
        }
    }
}

pub struct RetryExecutor {
    policy: RetryPolicy,
}

impl RetryExecutor {
    pub fn new(policy: RetryPolicy) -> Self {
        Self { policy }
    }

    pub fn from_config(config: &TestConfig) -> Self {
        Self::new(RetryPolicy::from_config(config))
    }

    pub async fn execute_with_retry<F, Fut>(
        &self,
        test: &TestCase,
        executor: F,
    ) -> TestingResult<TestExecutionResult>
    where
        F: Fn(&TestCase) -> Fut,
        Fut: std::future::Future<Output = TestingResult<TestExecutionResult>>,
    {
        let mut retry_count = 0;
        let mut last_result = None;
        let mut results: Vec<TestExecutionResult> = Vec::new();

        loop {
            let result = executor(test).await?;

            if result.is_success() || !self.policy.should_retry(&result) {
                let mut final_result = result;
                if retry_count > 0 {
                    final_result = final_result
                        .with_retry_count(retry_count)
                        .with_flaky_detected(results.iter().any(|r| !r.is_success()));
                }
                return Ok(final_result);
            }

            results.push(result.clone());
            last_result = Some(result);
            retry_count += 1;

            if retry_count > self.policy.max_retries {
                break;
            }

            let delay = self.policy.next_delay(retry_count - 1);
            debug!(
                "Retrying test {} in {:?} (attempt {}/{})",
                test.name, delay, retry_count, self.policy.max_retries
            );

            tokio::time::sleep(delay).await;
        }

        let mut result = last_result.unwrap_or_else(|| {
            TestExecutionResult::error(test, "No result after retries")
        });
        result = result.with_retry_count(retry_count);

        warn!(
            "Test {} failed after {} retries",
            test.name, retry_count
        );

        Ok(result)
    }

    pub fn policy(&self) -> &RetryPolicy {
        &self.policy
    }
}

#[derive(Debug, Clone)]
pub struct RetryStats {
    pub total_retries: usize,
    pub tests_retried: usize,
    pub retries_succeeded: usize,
    pub retries_failed: usize,
    pub total_delay: Duration,
}

impl Default for RetryStats {
    fn default() -> Self {
        Self {
            total_retries: 0,
            tests_retried: 0,
            retries_succeeded: 0,
            retries_failed: 0,
            total_delay: Duration::ZERO,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn create_test_case() -> TestCase {
        TestCase::new("test1", "test_addition", PathBuf::from("test.rs"), 10)
    }

    #[test]
    fn test_retry_policy() {
        let policy = RetryPolicy::new(3)
            .with_backoff(BackoffStrategy::Exponential { base_ms: 100, max_ms: 1000 });

        assert_eq!(policy.max_retries, 3);
    }

    #[test]
    fn test_should_retry() {
        let policy = RetryPolicy::new(3);
        let test = create_test_case();

        let result = TestExecutionResult::timed_out(&test, Duration::from_secs(10));
        assert!(policy.should_retry(&result));

        let result = TestExecutionResult::passed(&test, Duration::from_millis(100));
        assert!(!policy.should_retry(&result));
    }

    #[test]
    fn test_backoff_delay() {
        let policy = RetryPolicy::new(3)
            .with_backoff(BackoffStrategy::Exponential { base_ms: 100, max_ms: 1000 })
            .with_jitter(false);

        let delay0 = policy.next_delay(0);
        let delay1 = policy.next_delay(1);
        let delay2 = policy.next_delay(2);

        assert_eq!(delay0, Duration::from_millis(100));
        assert_eq!(delay1, Duration::from_millis(200));
        assert_eq!(delay2, Duration::from_millis(400));
    }

    #[test]
    fn test_retry_condition() {
        let test = create_test_case();

        let timeout_result = TestExecutionResult::timed_out(&test, Duration::from_secs(10));
        assert!(RetryCondition::Timeout.matches(&timeout_result));
        assert!(!RetryCondition::Failure.matches(&timeout_result));

        let failed_result = TestExecutionResult::failed(&test, Duration::from_millis(100), "error");
        assert!(RetryCondition::Failure.matches(&failed_result));
    }
}
