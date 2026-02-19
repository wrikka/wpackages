use crate::types::{TestResult, TestExecutionResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestHistory {
    pub runs: Vec<TestRunRecord>,
    pub test_stats: HashMap<String, TestStats>,
    pub flaky_tests: Vec<String>,
    pub slow_tests: Vec<String>,
}

impl TestHistory {
    pub fn new() -> Self {
        Self {
            runs: Vec::new(),
            test_stats: HashMap::new(),
            flaky_tests: Vec::new(),
            slow_tests: Vec::new(),
        }
    }

    pub fn record_run(&mut self, run: TestRunRecord) {
        for result in &run.results {
            let test_id_str = result.test_id.to_string();
            let stats = self.test_stats.entry(test_id_str.clone()).or_default();
            stats.record_result(&result.result);
            stats.total_duration += result.duration;
            stats.run_count += 1;

            if result.was_retried() {
                if !self.flaky_tests.contains(&test_id_str) {
                    self.flaky_tests.push(test_id_str.clone());
                }
            }

            if result.duration > Duration::from_secs(5) {
                if !self.slow_tests.contains(&test_id_str) {
                    self.slow_tests.push(test_id_str);
                }
            }
        }
        self.runs.push(run);
    }

    pub fn get_stats(&self, test_id: &str) -> Option<&TestStats> {
        self.test_stats.get(test_id)
    }

    pub fn recent_runs(&self, count: usize) -> &[TestRunRecord] {
        let start = self.runs.len().saturating_sub(count);
        &self.runs[start..]
    }

    pub fn total_runs(&self) -> usize {
        self.runs.len()
    }

    pub fn success_rate(&self, test_id: &str) -> f64 {
        self.test_stats
            .get(test_id)
            .map(|s| s.success_rate())
            .unwrap_or(0.0)
    }

    pub fn is_flaky(&self, test_id: &str) -> bool {
        self.flaky_tests.contains(&test_id.to_string())
    }

    pub fn is_slow(&self, test_id: &str) -> bool {
        self.slow_tests.contains(&test_id.to_string())
    }
}

impl Default for TestHistory {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestRunRecord {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub branch: Option<String>,
    pub commit: Option<String>,
    pub results: Vec<TestExecutionResult>,
    pub total_duration: Duration,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
}

impl TestRunRecord {
    pub fn new(results: Vec<TestExecutionResult>) -> Self {
        let passed = results.iter().filter(|r| r.result == TestResult::Passed).count();
        let failed = results.iter().filter(|r| r.result == TestResult::Failed).count();
        let skipped = results.iter().filter(|r| r.result == TestResult::Skipped).count();
        let total_duration = results.iter().map(|r| r.duration).sum();

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now(),
            branch: None,
            commit: None,
            results,
            total_duration,
            passed,
            failed,
            skipped,
        }
    }

    pub fn with_branch(mut self, branch: impl Into<String>) -> Self {
        self.branch = Some(branch.into());
        self
    }

    pub fn with_commit(mut self, commit: impl Into<String>) -> Self {
        self.commit = Some(commit.into());
        self
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
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TestStats {
    pub run_count: usize,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
    pub timed_out: usize,
    pub errors: usize,
    pub total_duration: Duration,
    pub last_result: Option<TestResult>,
    pub last_run: Option<chrono::DateTime<chrono::Utc>>,
}

impl TestStats {
    pub fn record_result(&mut self, result: &TestResult) {
        self.run_count += 1;
        self.last_result = Some(*result);
        self.last_run = Some(chrono::Utc::now());

        match result {
            TestResult::Passed => self.passed += 1,
            TestResult::Failed => self.failed += 1,
            TestResult::Skipped => self.skipped += 1,
            TestResult::TimedOut => self.timed_out += 1,
            TestResult::Error => self.errors += 1,
        }
    }

    pub fn success_rate(&self) -> f64 {
        if self.run_count == 0 {
            0.0
        } else {
            self.passed as f64 / self.run_count as f64
        }
    }

    pub fn avg_duration(&self) -> Duration {
        if self.run_count == 0 {
            Duration::ZERO
        } else {
            self.total_duration / self.run_count as u32
        }
    }

    pub fn failure_rate(&self) -> f64 {
        if self.run_count == 0 {
            0.0
        } else {
            (self.failed + self.errors) as f64 / self.run_count as f64
        }
    }

    pub fn is_flaky(&self) -> bool {
        self.run_count >= 3 && self.passed > 0 && self.failed > 0 && self.failure_rate() > 0.1 && self.failure_rate() < 0.9
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryStore {
    pub storage_path: PathBuf,
    pub max_runs: usize,
    pub history: TestHistory,
}

impl HistoryStore {
    pub fn new(storage_path: PathBuf) -> Self {
        Self {
            storage_path,
            max_runs: 100,
            history: TestHistory::new(),
        }
    }

    pub fn with_max_runs(mut self, max: usize) -> Self {
        self.max_runs = max;
        self
    }

    pub fn load(&mut self) -> Result<(), std::io::Error> {
        if self.storage_path.exists() {
            let content = std::fs::read_to_string(&self.storage_path)?;
            self.history = serde_json::from_str(&content).unwrap_or_default();
        }
        Ok(())
    }

    pub fn save(&self) -> Result<(), std::io::Error> {
        if let Some(parent) = self.storage_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let content = serde_json::to_string_pretty(&self.history)?;
        std::fs::write(&self.storage_path, content)
    }

    pub fn record(&mut self, run: TestRunRecord) {
        self.history.record_run(run);

        while self.history.runs.len() > self.max_runs {
            self.history.runs.remove(0);
        }
    }

    pub fn history(&self) -> &TestHistory {
        &self.history
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::TestCase;

    fn create_test_case() -> TestCase {
        TestCase::new("test1", "test_addition", PathBuf::from("test.rs"), 10)
    }

    #[test]
    fn test_stats() {
        let mut stats = TestStats::default();
        stats.record_result(&TestResult::Passed);
        stats.record_result(&TestResult::Failed);
        stats.record_result(&TestResult::Passed);

        assert_eq!(stats.run_count, 3);
        assert!((stats.success_rate() - 0.666).abs() < 0.01);
    }

    #[test]
    fn test_history() {
        let mut history = TestHistory::new();
        let tc = create_test_case();
        let result = TestExecutionResult::passed(&tc, Duration::from_millis(100));
        let run = TestRunRecord::new(vec![result]);

        history.record_run(run);

        assert_eq!(history.total_runs(), 1);
        assert!(history.get_stats("test1").is_some());
    }

    #[test]
    fn test_flaky_detection() {
        let mut stats = TestStats::default();
        for _ in 0..5 {
            stats.record_result(&TestResult::Passed);
        }
        for _ in 0..2 {
            stats.record_result(&TestResult::Failed);
        }

        assert!(stats.is_flaky());
    }
}
