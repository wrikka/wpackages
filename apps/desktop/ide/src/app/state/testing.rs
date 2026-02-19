use crate::types::testing::{TestRunResult, TestConfig};

#[derive(Debug, Clone, Default)]
pub struct TestingState {
    pub config: TestConfig,
    pub last_result: Option<TestRunResult>,
    pub running: bool,
    pub total_tests: usize,
    pub passed: usize,
    pub failed: usize,
}

impl TestingState {
    pub fn new() -> Self {
        Self {
            config: TestConfig::new(),
            last_result: None,
            running: false,
            total_tests: 0,
            passed: 0,
            failed: 0,
        }
    }

    pub fn with_config(mut self, config: TestConfig) -> Self {
        self.config = config;
        self
    }

    pub fn with_last_result(mut self, result: TestRunResult) -> Self {
        self.last_result = Some(result);
        self
    }

    pub fn with_running(mut self, running: bool) -> Self {
        self.running = running;
        self
    }

    pub fn set_config(&mut self, config: TestConfig) {
        self.config = config;
    }

    pub fn set_running(&mut self, running: bool) {
        self.running = running;
    }

    pub fn update_stats(&mut self, total: usize, passed: usize, failed: usize) {
        self.total_tests = total;
        self.passed = passed;
        self.failed = failed;
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn success_rate(&self) -> f64 {
        if self.total_tests > 0 {
            (self.passed as f64 / self.total_tests as f64) * 100.0
        } else {
            0.0
        }
    }
}
