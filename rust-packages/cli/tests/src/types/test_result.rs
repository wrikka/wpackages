use super::{TestCase, TestCaseId};
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TestResult {
    Passed,
    Failed,
    Skipped,
    TimedOut,
    Error,
}

impl TestResult {
    pub fn is_success(&self) -> bool {
        matches!(self, Self::Passed)
    }

    pub fn is_failure(&self) -> bool {
        matches!(self, Self::Failed | Self::Error)
    }

    pub fn is_skipped(&self) -> bool {
        matches!(self, Self::Skipped)
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Passed => "passed",
            Self::Failed => "failed",
            Self::Skipped => "skipped",
            Self::TimedOut => "timed_out",
            Self::Error => "error",
        }
    }

    pub fn icon(&self) -> &'static str {
        match self {
            Self::Passed => "✓",
            Self::Failed => "✗",
            Self::Skipped => "⊘",
            Self::TimedOut => "⏱",
            Self::Error => "!",
        }
    }

    pub fn color_code(&self) -> &'static str {
        match self {
            Self::Passed => "32",
            Self::Failed => "31",
            Self::Skipped => "33",
            Self::TimedOut => "35",
            Self::Error => "31",
        }
    }
}

impl std::fmt::Display for TestResult {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestExecutionResult {
    pub test_id: TestCaseId,
    pub test_name: String,
    pub result: TestResult,
    pub duration: Duration,
    pub output: String,
    pub error_message: Option<String>,
    pub retry_count: usize,
    pub flaky_detected: bool,
    pub memory_usage_bytes: Option<u64>,
    pub cpu_time: Option<Duration>,
}

impl TestExecutionResult {
    pub fn new(test: &TestCase, result: TestResult, duration: Duration) -> Self {
        Self {
            test_id: test.id.clone(),
            test_name: test.name.clone(),
            result,
            duration,
            output: String::new(),
            error_message: None,
            retry_count: 0,
            flaky_detected: false,
            memory_usage_bytes: None,
            cpu_time: None,
        }
    }

    pub fn passed(test: &TestCase, duration: Duration) -> Self {
        Self::new(test, TestResult::Passed, duration)
    }

    pub fn failed(test: &TestCase, duration: Duration, error: impl Into<String>) -> Self {
        Self::new(test, TestResult::Failed, duration).with_error_message(error)
    }

    pub fn skipped(test: &TestCase, reason: impl Into<String>) -> Self {
        Self::new(test, TestResult::Skipped, Duration::ZERO).with_output(reason)
    }

    pub fn timed_out(test: &TestCase, duration: Duration) -> Self {
        Self::new(test, TestResult::TimedOut, duration)
            .with_error_message(format!("Test timed out after {:?}", duration))
    }

    pub fn error(test: &TestCase, error: impl Into<String>) -> Self {
        Self::new(test, TestResult::Error, Duration::ZERO).with_error_message(error)
    }

    pub fn with_output(mut self, output: impl Into<String>) -> Self {
        self.output = output.into();
        self
    }

    pub fn with_error_message(mut self, error: impl Into<String>) -> Self {
        self.error_message = Some(error.into());
        self
    }

    pub fn with_retry_count(mut self, count: usize) -> Self {
        self.retry_count = count;
        self
    }

    pub fn with_flaky_detected(mut self, flaky: bool) -> Self {
        self.flaky_detected = flaky;
        self
    }

    pub fn with_memory_usage(mut self, bytes: u64) -> Self {
        self.memory_usage_bytes = Some(bytes);
        self
    }

    pub fn with_cpu_time(mut self, cpu_time: Duration) -> Self {
        self.cpu_time = Some(cpu_time);
        self
    }

    pub fn is_success(&self) -> bool {
        self.result.is_success()
    }

    pub fn is_failure(&self) -> bool {
        self.result.is_failure()
    }

    pub fn was_retried(&self) -> bool {
        self.retry_count > 0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSuiteResult {
    pub suite_id: String,
    pub suite_name: String,
    pub results: Vec<TestExecutionResult>,
    pub total_duration: Duration,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
    pub timed_out: usize,
    pub errors: usize,
}

impl TestSuiteResult {
    pub fn new(suite_id: impl Into<String>, suite_name: impl Into<String>) -> Self {
        Self {
            suite_id: suite_id.into(),
            suite_name: suite_name.into(),
            results: Vec::new(),
            total_duration: Duration::ZERO,
            passed: 0,
            failed: 0,
            skipped: 0,
            timed_out: 0,
            errors: 0,
        }
    }

    pub fn add_result(&mut self, result: TestExecutionResult) {
        self.total_duration += result.duration;

        match result.result {
            TestResult::Passed => self.passed += 1,
            TestResult::Failed => self.failed += 1,
            TestResult::Skipped => self.skipped += 1,
            TestResult::TimedOut => self.timed_out += 1,
            TestResult::Error => self.errors += 1,
        }

        self.results.push(result);
    }

    pub fn total_tests(&self) -> usize {
        self.results.len()
    }

    pub fn success_rate(&self) -> f64 {
        if self.total_tests() == 0 {
            0.0
        } else {
            self.passed as f64 / self.total_tests() as f64
        }
    }

    pub fn is_all_passed(&self) -> bool {
        self.failed == 0 && self.errors == 0
    }

    pub fn failed_tests(&self) -> Vec<&TestExecutionResult> {
        self.results.iter().filter(|r| r.is_failure()).collect()
    }

    pub fn retried_tests(&self) -> Vec<&TestExecutionResult> {
        self.results.iter().filter(|r| r.was_retried()).collect()
    }

    pub fn flaky_tests(&self) -> Vec<&TestExecutionResult> {
        self.results.iter().filter(|r| r.flaky_detected).collect()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestRunResult {
    pub suites: Vec<TestSuiteResult>,
    pub total_duration: Duration,
    pub total_tests: usize,
    pub total_passed: usize,
    pub total_failed: usize,
    pub total_skipped: usize,
    pub total_timed_out: usize,
    pub total_errors: usize,
    pub total_retries: usize,
    pub total_flaky: usize,
}

impl TestRunResult {
    pub fn new() -> Self {
        Self {
            suites: Vec::new(),
            total_duration: Duration::ZERO,
            total_tests: 0,
            total_passed: 0,
            total_failed: 0,
            total_skipped: 0,
            total_timed_out: 0,
            total_errors: 0,
            total_retries: 0,
            total_flaky: 0,
        }
    }

    pub fn add_suite_result(&mut self, suite_result: TestSuiteResult) {
        self.total_duration += suite_result.total_duration;
        self.total_tests += suite_result.total_tests();
        self.total_passed += suite_result.passed;
        self.total_failed += suite_result.failed;
        self.total_skipped += suite_result.skipped;
        self.total_timed_out += suite_result.timed_out;
        self.total_errors += suite_result.errors;
        self.total_retries += suite_result.retried_tests().len();
        self.total_flaky += suite_result.flaky_tests().len();

        self.suites.push(suite_result);
    }

    pub fn success_rate(&self) -> f64 {
        if self.total_tests == 0 {
            0.0
        } else {
            self.total_passed as f64 / self.total_tests as f64
        }
    }

    pub fn is_all_passed(&self) -> bool {
        self.total_failed == 0 && self.total_errors == 0
    }

    pub fn failed_tests(&self) -> Vec<&TestExecutionResult> {
        self.suites
            .iter()
            .flat_map(|s| s.failed_tests())
            .collect()
    }

    pub fn summary(&self) -> String {
        format!(
            "Tests: {} total, {} passed, {} failed, {} skipped, {} timed out, {} errors ({:.1}% success)",
            self.total_tests,
            self.total_passed,
            self.total_failed,
            self.total_skipped,
            self.total_timed_out,
            self.total_errors,
            self.success_rate() * 100.0
        )
    }
}

impl Default for TestRunResult {
    fn default() -> Self {
        Self::new()
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
    fn test_result_status() {
        assert!(TestResult::Passed.is_success());
        assert!(!TestResult::Failed.is_success());
        assert!(TestResult::Failed.is_failure());
        assert!(TestResult::Skipped.is_skipped());
    }

    #[test]
    fn test_execution_result() {
        let tc = create_test_case();
        let result = TestExecutionResult::passed(&tc, Duration::from_millis(100));

        assert!(result.is_success());
        assert_eq!(result.duration, Duration::from_millis(100));
    }

    #[test]
    fn test_suite_result() {
        let tc = create_test_case();
        let mut suite_result = TestSuiteResult::new("suite1", "Test Suite");

        suite_result.add_result(TestExecutionResult::passed(&tc, Duration::from_millis(100)));
        suite_result.add_result(TestExecutionResult::failed(&tc, Duration::from_millis(50), "assertion failed"));

        assert_eq!(suite_result.total_tests(), 2);
        assert_eq!(suite_result.passed, 1);
        assert_eq!(suite_result.failed, 1);
    }

    #[test]
    fn test_run_result() {
        let mut run_result = TestRunResult::new();
        let mut suite = TestSuiteResult::new("suite1", "Suite");

        let tc = create_test_case();
        suite.add_result(TestExecutionResult::passed(&tc, Duration::from_millis(100)));

        run_result.add_suite_result(suite);

        assert_eq!(run_result.total_tests, 1);
        assert!(run_result.is_all_passed());
    }
}
