use crate::components::{TestDiscovery, TestRunner, TestRunnerImpl};
use crate::error::{TestingError, TestingResult};
use crate::types::{
    TestConfig, TestCoverage, TestReport, TestRunResult, TestSuite, TestSuiteResult,
    TestExecutionResult, TestCase,
};
use async_trait::async_trait;
use std::path::Path;
use std::sync::Arc;
use parking_lot::Mutex;
use tracing::{info, warn};

/// Test client trait
#[async_trait]
pub trait TestClient: Send + Sync {
    /// Discover tests
    async fn discover_tests(&self, root: &Path) -> TestingResult<Vec<TestSuite>>;

    /// Run all tests
    async fn run_all_tests(&self, config: TestConfig) -> TestingResult<TestRunResult>;

    /// Run test suite
    async fn run_suite(&self, suite: &TestSuite, config: &TestConfig) -> TestingResult<TestSuiteResult>;

    /// Run single test
    async fn run_test(&self, test_case: &TestCase, config: &TestConfig) -> TestingResult<TestExecutionResult>;

    /// Is running
    fn is_running(&self) -> bool;

    /// Get test config
    fn get_config(&self) -> TestConfig;

    /// Set test config
    fn set_config(&self, config: TestConfig);

    /// Get coverage
    async fn get_coverage(&self, config: &TestConfig) -> TestingResult<Vec<TestCoverage>>;

    /// Generate report
    fn generate_report(&self, run_result: TestRunResult) -> TestReport;
}

/// Test client implementation
pub struct TestClientImpl {
    discovery: TestDiscovery,
    runner: TestRunnerImpl,
    config: Arc<Mutex<TestConfig>>,
}

impl TestClientImpl {
    pub fn new() -> Self {
        Self {
            discovery: TestDiscovery::new(),
            runner: TestRunnerImpl::new(),
            config: Arc::new(Mutex::new(TestConfig::default())),
        }
    }

    pub fn with_config(mut self, config: TestConfig) -> Self {
        self.config = Arc::new(Mutex::new(config));
        self
    }

    pub fn with_discovery(mut self, discovery: TestDiscovery) -> Self {
        self.discovery = discovery;
        self
    }

    pub async fn run_tests_internal(&self, suites: Vec<TestSuite>, config: &TestConfig) -> TestingResult<TestRunResult> {
        let mut run_result = TestRunResult::new();

        for suite in &suites {
            let suite_result = self.runner.run_suite(suite, config).await?;
            run_result.add_suite_result(suite_result);

            if config.fail_fast && !run_result.is_all_passed() {
                info!("Fail fast enabled, stopping after first failure");
                break;
            }
        }

        Ok(run_result)
    }

    pub async fn collect_coverage(&self, _config: &TestConfig) -> TestingResult<Vec<TestCoverage>> {
        Ok(Vec::new())
    }
}

impl Default for TestClientImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl TestClient for TestClientImpl {
    async fn discover_tests(&self, root: &Path) -> TestingResult<Vec<TestSuite>> {
        info!("Discovering tests in {:?}", root);

        let mut suites = self.discovery.discover(root).await?;

        let config = self.config.lock();

        if !config.filter_tags.is_empty() {
            let tags: Vec<&str> = config.filter_tags.iter().map(|s| s.as_str()).collect();
            suites = self.discovery.filter_by_tags(suites, &tags);
        }

        if let Some(pattern) = &config.filter_pattern {
            suites = self.discovery.filter_by_pattern(suites, pattern)?;
        }

        info!("Discovered {} test suites", suites.len());

        Ok(suites)
    }

    async fn run_all_tests(&self, config: TestConfig) -> TestingResult<TestRunResult> {
        info!("Running all tests with config: {:?}", config);

        self.set_config(config.clone());

        let root = config.working_dir.as_deref().unwrap_or_else(|| Path::new("."));
        let suites = self.discover_tests(root).await?;

        if suites.is_empty() {
            warn!("No tests found");
            return Ok(TestRunResult::new());
        }

        let run_result = self.run_tests_internal(suites, &config).await?;

        info!("Test run completed: {}/{} passed",
            run_result.total_passed, run_result.total_tests);

        Ok(run_result)
    }

    async fn run_suite(&self, suite: &TestSuite, config: &TestConfig) -> TestingResult<TestSuiteResult> {
        info!("Running test suite: {}", suite.name);

        let result = self.runner.run_suite(suite, config).await?;

        info!("Suite completed: {}/{} passed", result.passed, result.total_tests());

        Ok(result)
    }

    async fn run_test(&self, test_case: &TestCase, config: &TestConfig) -> TestingResult<TestExecutionResult> {
        info!("Running test: {}", test_case.name);

        let result = self.runner.run_test(test_case, config).await?;

        info!("Test completed: {}", result.result.as_str());

        Ok(result)
    }

    fn is_running(&self) -> bool {
        self.runner.is_running()
    }

    fn get_config(&self) -> TestConfig {
        self.config.lock().clone()
    }

    fn set_config(&self, config: TestConfig) {
        *self.config.lock() = config;
    }

    async fn get_coverage(&self, config: &TestConfig) -> TestingResult<Vec<TestCoverage>> {
        self.collect_coverage(config).await
    }

    fn generate_report(&self, run_result: TestRunResult) -> TestReport {
        info!("Generating test report");
        TestReport::new("Test Run", run_result)
    }
}

/// Create a new test client
pub fn create_test_client() -> TestClientImpl {
    TestClientImpl::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_test_client() {
        let client = create_test_client();

        let config = client.get_config();
        assert_eq!(config.test_framework, "cargo");

        assert!(!client.is_running());
    }

    #[tokio::test]
    async fn test_discover_tests() {
        let client = create_test_client();

        let temp_dir = tempfile::tempdir().unwrap();
        let test_file = temp_dir.path().join("test.rs");

        std::fs::write(
            &test_file,
            r#"
#[test]
fn test_addition() {
    assert_eq!(2 + 2, 4);
}
"#,
        )
        .unwrap();

        let suites = client.discover_tests(temp_dir.path()).await.unwrap();

        assert_eq!(suites.len(), 1);
        assert_eq!(suites[0].test_count(), 1);
    }
}
