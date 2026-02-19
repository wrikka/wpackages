#[derive(Debug, Clone, Default)]
pub struct TestConfig {
    pub parallel: bool,
    pub max_concurrent: usize,
    pub fail_fast: bool,
    pub retry_flaky: bool,
    pub max_retries: usize,
}

impl TestConfig {
    pub fn new() -> Self {
        Self {
            parallel: false,
            max_concurrent: 1,
            fail_fast: false,
            retry_flaky: true,
            max_retries: 3,
        }
    }
}

#[derive(Debug, Clone)]
pub struct TestRunResult {
    pub total: usize,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
    pub duration: std::time::Duration,
}

impl TestRunResult {
    pub fn new() -> Self {
        Self {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: std::time::Duration::ZERO,
        }
    }
}

impl Default for TestRunResult {
    fn default() -> Self {
        Self::new()
    }
}
