use crate::error::{TestingError, TestingResult};
use crate::types::{TestConfig, TestExecutionResult, TestSuite, TestSuiteResult};
use async_trait::async_trait;
use std::process::Command;
use std::time::{Duration, Instant};
use std::sync::atomic::{AtomicBool, Ordering};
use tracing::{debug, info};

/// Test runner trait
#[async_trait]
pub trait TestRunner: Send + Sync {
    /// Run test suite
    async fn run_suite(&self, suite: &TestSuite, config: &TestConfig) -> TestingResult<TestSuiteResult>;

    /// Run single test
    async fn run_test(&self, test_case: &crate::types::TestCase, config: &TestConfig) -> TestingResult<TestExecutionResult>;

    /// Is running
    fn is_running(&self) -> bool;
}

/// Test runner implementation
pub struct TestRunnerImpl {
    running: AtomicBool,
}

impl TestRunnerImpl {
    pub fn new() -> Self {
        Self {
            running: AtomicBool::new(false),
        }
    }

    async fn run_command(&self, config: &TestConfig, test_filter: Option<&str>) -> TestingResult<(String, String, bool)> {
        let mut cmd = Command::new("cargo");
        cmd.arg("test");

        if let Some(filter) = test_filter {
            cmd.arg("--");
            cmd.arg(filter);
        }

        for (key, value) in &config.env {
            cmd.env(key, value);
        }

        if let Some(cwd) = &config.working_dir {
            cmd.current_dir(cwd);
        }

        debug!("Running command: {:?}", cmd);

        let start = Instant::now();

        let output = tokio::process::Command::from(cmd)
            .output()
            .await
            .map_err(|e| TestingError::runner_error(format!("Failed to execute: {}", e)))?;

        let duration = start.elapsed();

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let success = output.status.success();

        debug!("Command completed in {:?}, success: {}", duration, success);

        Ok((stdout, stderr, success))
    }

    fn parse_test_output(&self, output: &str, suite: &TestSuite) -> Vec<TestExecutionResult> {
        let mut results = Vec::new();

        for test_case in &suite.test_cases {
            if output.contains(&format!("test {} ...", test_case.name))
                || output.contains(&format!("{} ...", test_case.name))
            {
                if output.contains("ok") || output.contains("passed") {
                    results.push(TestExecutionResult::passed(test_case, Duration::from_millis(100)));
                } else if output.contains("FAILED") || output.contains("failed") {
                    results.push(TestExecutionResult::failed(test_case, Duration::from_millis(100), "Test failed"));
                } else {
                    results.push(TestExecutionResult::skipped(test_case, "not found in output"));
                }
            } else {
                results.push(TestExecutionResult::skipped(test_case, "not found in output"));
            }
        }

        results
    }
}

impl Default for TestRunnerImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl TestRunner for TestRunnerImpl {
    async fn run_suite(&self, suite: &TestSuite, config: &TestConfig) -> TestingResult<TestSuiteResult> {
        info!("Running test suite: {}", suite.name);

        let mut suite_result = TestSuiteResult::new(&suite.id, &suite.name);

        self.running.store(true, Ordering::SeqCst);

        let (stdout, stderr, success) = self.run_command(config, None).await?;

        let results = self.parse_test_output(&stdout, suite);

        for result in results {
            suite_result.add_result(result);
        }

        if suite_result.total_tests() == 0 {
            for test_case in &suite.test_cases {
                let result = if success {
                    TestExecutionResult::passed(test_case, Duration::from_millis(100))
                        .with_output(stdout.clone())
                } else {
                    TestExecutionResult::failed(test_case, Duration::from_millis(100), &stderr)
                        .with_output(stdout.clone())
                };

                suite_result.add_result(result);
            }
        }

        self.running.store(false, Ordering::SeqCst);

        info!("Test suite completed: {} passed, {} failed, {} skipped",
            suite_result.passed, suite_result.failed, suite_result.skipped);

        Ok(suite_result)
    }

    async fn run_test(&self, test_case: &crate::types::TestCase, config: &TestConfig) -> TestingResult<TestExecutionResult> {
        info!("Running test: {}", test_case.name);

        self.running.store(true, Ordering::SeqCst);

        let start = Instant::now();

        let test_filter = Some(test_case.name.clone());
        let (stdout, stderr, success) = self.run_command(config, test_filter.as_deref()).await?;

        let duration = start.elapsed();

        let result = if success {
            TestExecutionResult::passed(test_case, duration).with_output(stdout)
        } else {
            TestExecutionResult::failed(test_case, duration, &stderr).with_output(stdout)
        };

        self.running.store(false, Ordering::SeqCst);

        info!("Test completed in {:?}: {}", duration, result.result.as_str());

        Ok(result)
    }

    fn is_running(&self) -> bool {
        self.running.load(Ordering::SeqCst)
    }
}

/// Create a new test runner
pub fn create_test_runner() -> TestRunnerImpl {
    TestRunnerImpl::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_runner_creation() {
        let runner = create_test_runner();
        assert!(!runner.is_running());
    }
}
