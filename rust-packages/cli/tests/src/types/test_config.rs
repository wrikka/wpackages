use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestConfig {
    pub parallel: bool,
    pub max_concurrent: usize,
    pub fail_fast: bool,
    pub retry_flaky: bool,
    pub max_retries: usize,
    pub retry_backoff: BackoffStrategy,
    pub timeout: Option<Duration>,
    pub test_timeout: Option<Duration>,
    pub filter_tags: Vec<String>,
    pub filter_pattern: Option<String>,
    pub exclude_pattern: Option<String>,
    pub collect_coverage: bool,
    pub coverage_output: Option<PathBuf>,
    pub generate_report: bool,
    pub report_format: ReportFormat,
    pub watch: bool,
    pub watch_debounce: Duration,
    pub sandbox: bool,
    pub env: HashMap<String, String>,
    pub working_dir: Option<PathBuf>,
}

impl TestConfig {
    pub fn new() -> Self {
        Self {
            parallel: false,
            max_concurrent: num_cpus::get(),
            fail_fast: false,
            retry_flaky: true,
            max_retries: 3,
            retry_backoff: BackoffStrategy::Exponential { base_ms: 100, max_ms: 5000 },
            timeout: None,
            test_timeout: None,
            filter_tags: Vec::new(),
            filter_pattern: None,
            exclude_pattern: None,
            collect_coverage: true,
            coverage_output: None,
            generate_report: true,
            report_format: ReportFormat::default(),
            watch: false,
            watch_debounce: Duration::from_millis(100),
            sandbox: false,
            env: HashMap::new(),
            working_dir: None,
        }
    }

    pub fn with_parallel(mut self, parallel: bool) -> Self {
        self.parallel = parallel;
        self
    }

    pub fn with_max_concurrent(mut self, max: usize) -> Self {
        self.max_concurrent = max;
        self
    }

    pub fn with_fail_fast(mut self, fail_fast: bool) -> Self {
        self.fail_fast = fail_fast;
        self
    }

    pub fn with_retry_flaky(mut self, retry: bool) -> Self {
        self.retry_flaky = retry;
        self
    }

    pub fn with_max_retries(mut self, max: usize) -> Self {
        self.max_retries = max;
        self
    }

    pub fn with_retry_backoff(mut self, backoff: BackoffStrategy) -> Self {
        self.retry_backoff = backoff;
        self
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }

    pub fn with_test_timeout(mut self, timeout: Duration) -> Self {
        self.test_timeout = Some(timeout);
        self
    }

    pub fn with_filter_tags(mut self, tags: Vec<String>) -> Self {
        self.filter_tags = tags;
        self
    }

    pub fn with_filter_pattern(mut self, pattern: impl Into<String>) -> Self {
        self.filter_pattern = Some(pattern.into());
        self
    }

    pub fn with_exclude_pattern(mut self, pattern: impl Into<String>) -> Self {
        self.exclude_pattern = Some(pattern.into());
        self
    }

    pub fn with_collect_coverage(mut self, collect: bool) -> Self {
        self.collect_coverage = collect;
        self
    }

    pub fn with_coverage_output(mut self, path: PathBuf) -> Self {
        self.coverage_output = Some(path);
        self
    }

    pub fn with_generate_report(mut self, generate: bool) -> Self {
        self.generate_report = generate;
        self
    }

    pub fn with_report_format(mut self, format: ReportFormat) -> Self {
        self.report_format = format;
        self
    }

    pub fn with_watch(mut self, watch: bool) -> Self {
        self.watch = watch;
        self
    }

    pub fn with_watch_debounce(mut self, debounce: Duration) -> Self {
        self.watch_debounce = debounce;
        self
    }

    pub fn with_sandbox(mut self, sandbox: bool) -> Self {
        self.sandbox = sandbox;
        self
    }

    pub fn with_env(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.env.insert(key.into(), value.into());
        self
    }

    pub fn with_working_dir(mut self, dir: PathBuf) -> Self {
        self.working_dir = Some(dir);
        self
    }

    pub fn effective_timeout(&self, test_timeout: Option<Duration>) -> Option<Duration> {
        test_timeout.or(self.test_timeout).or(self.timeout)
    }

    pub fn calculate_backoff_delay(&self, retry_count: usize) -> Duration {
        self.retry_backoff.delay(retry_count)
    }
}

impl Default for TestConfig {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BackoffStrategy {
    Fixed { delay_ms: u64 },
    Linear { base_ms: u64, max_ms: u64 },
    Exponential { base_ms: u64, max_ms: u64 },
}

impl BackoffStrategy {
    pub fn delay(&self, retry_count: usize) -> Duration {
        match self {
            Self::Fixed { delay_ms } => Duration::from_millis(*delay_ms),
            Self::Linear { base_ms, max_ms } => {
                let delay = base_ms.saturating_mul(retry_count as u64);
                Duration::from_millis(delay.min(*max_ms))
            }
            Self::Exponential { base_ms, max_ms } => {
                let delay = base_ms.saturating_mul(2u64.pow(retry_count as u32));
                Duration::from_millis(delay.min(*max_ms))
            }
        }
    }
}

impl Default for BackoffStrategy {
    fn default() -> Self {
        Self::Exponential {
            base_ms: 100,
            max_ms: 5000,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum ReportFormat {
    #[default]
    Text,
    Json,
    Html,
    JUnit,
    Tap,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    pub enabled: bool,
    pub cache_dir: PathBuf,
    pub max_age: Duration,
    pub max_size_bytes: u64,
    pub hash_algorithm: HashAlgorithm,
}

impl CacheConfig {
    pub fn new() -> Self {
        Self {
            enabled: true,
            cache_dir: std::env::temp_dir().join("testing_cache"),
            max_age: Duration::from_secs(86400 * 7),
            max_size_bytes: 100 * 1024 * 1024,
            hash_algorithm: HashAlgorithm::Blake3,
        }
    }

    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    pub fn with_cache_dir(mut self, dir: PathBuf) -> Self {
        self.cache_dir = dir;
        self
    }

    pub fn with_max_age(mut self, age: Duration) -> Self {
        self.max_age = age;
        self
    }

    pub fn with_max_size(mut self, bytes: u64) -> Self {
        self.max_size_bytes = bytes;
        self
    }
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HashAlgorithm {
    Blake3,
    Sha256,
    Sha512,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_defaults() {
        let config = TestConfig::new();
        assert!(!config.parallel);
        assert!(config.retry_flaky);
        assert_eq!(config.max_retries, 3);
    }

    #[test]
    fn test_backoff_strategies() {
        let fixed = BackoffStrategy::Fixed { delay_ms: 100 };
        assert_eq!(fixed.delay(3), Duration::from_millis(100));

        let linear = BackoffStrategy::Linear { base_ms: 100, max_ms: 500 };
        assert_eq!(linear.delay(2), Duration::from_millis(200));

        let exp = BackoffStrategy::Exponential { base_ms: 100, max_ms: 1000 };
        assert_eq!(exp.delay(2), Duration::from_millis(400));
    }

    #[test]
    fn test_config_builder() {
        let config = TestConfig::new()
            .with_parallel(true)
            .with_max_concurrent(4)
            .with_fail_fast(true);

        assert!(config.parallel);
        assert_eq!(config.max_concurrent, 4);
        assert!(config.fail_fast);
    }
}
