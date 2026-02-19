use crate::error::TestingResult;
use crate::types::{TestExecutionResult, TestHistory, TestResult, TestStats};
use std::collections::HashMap;
use std::time::Duration;
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub struct FlakyTestDetector {
    history: TestHistory,
    threshold: FlakyThreshold,
}

#[derive(Debug, Clone)]
pub struct FlakyThreshold {
    pub min_runs: usize,
    pub max_failure_rate: f64,
    pub min_failure_rate: f64,
}

impl Default for FlakyThreshold {
    fn default() -> Self {
        Self {
            min_runs: 5,
            max_failure_rate: 0.9,
            min_failure_rate: 0.1,
        }
    }
}

impl FlakyTestDetector {
    pub fn new() -> Self {
        Self {
            history: TestHistory::new(),
            threshold: FlakyThreshold::default(),
        }
    }

    pub fn with_threshold(mut self, threshold: FlakyThreshold) -> Self {
        self.threshold = threshold;
        self
    }

    pub fn with_history(mut self, history: TestHistory) -> Self {
        self.history = history;
        self
    }

    pub fn record_result(&mut self, result: &TestExecutionResult) {
        let test_id = result.test_id.as_str().to_string();
        let stats = self.history.test_stats.entry(test_id).or_default();
        stats.record_result(&result.result);
        stats.total_duration += result.duration;
        stats.run_count += 1;
    }

    pub fn is_flaky(&self, test_id: &str) -> bool {
        let stats = match self.history.test_stats.get(test_id) {
            Some(s) => s,
            None => return false,
        };

        if stats.run_count < self.threshold.min_runs {
            return false;
        }

        let failure_rate = stats.failure_rate();
        failure_rate >= self.threshold.min_failure_rate
            && failure_rate <= self.threshold.max_failure_rate
            && stats.passed > 0
            && stats.failed > 0
    }

    pub fn detect_flaky_tests(&self) -> Vec<FlakyTestInfo> {
        self.history
            .test_stats
            .iter()
            .filter(|(id, _)| self.is_flaky(id))
            .map(|(id, stats)| FlakyTestInfo {
                test_id: id.clone(),
                run_count: stats.run_count,
                pass_count: stats.passed,
                fail_count: stats.failed,
                failure_rate: stats.failure_rate(),
                avg_duration: stats.avg_duration(),
            })
            .collect()
    }

    pub fn get_stats(&self, test_id: &str) -> Option<&TestStats> {
        self.history.test_stats.get(test_id)
    }

    pub fn history(&self) -> &TestHistory {
        &self.history
    }

    pub fn suggest_retry_count(&self, test_id: &str) -> usize {
        let stats = match self.history.test_stats.get(test_id) {
            Some(s) => s,
            None => return 1,
        };

        if stats.run_count < 3 {
            return 1;
        }

        let success_rate = stats.success_rate();
        if success_rate > 0.9 {
            1
        } else if success_rate > 0.7 {
            2
        } else if success_rate > 0.5 {
            3
        } else {
            5
        }
    }
}

impl Default for FlakyTestDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct FlakyTestInfo {
    pub test_id: String,
    pub run_count: usize,
    pub pass_count: usize,
    pub fail_count: usize,
    pub failure_rate: f64,
    pub avg_duration: Duration,
}

impl FlakyTestInfo {
    pub fn summary(&self) -> String {
        format!(
            "{}: {}/{} passed ({:.1}% failure rate), avg {:?}",
            self.test_id,
            self.pass_count,
            self.run_count,
            self.failure_rate * 100.0,
            self.avg_duration
        )
    }

    pub fn confidence(&self) -> f64 {
        if self.run_count < 10 {
            0.5
        } else if self.run_count < 20 {
            0.7
        } else {
            0.9
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct FlakyReport {
    pub flaky_tests: Vec<FlakyTestInfo>,
    pub total_tests_analyzed: usize,
    pub detection_confidence: f64,
}

impl FlakyReport {
    pub fn new(flaky_tests: Vec<FlakyTestInfo>, total_tests: usize) -> Self {
        let confidence = if flaky_tests.is_empty() {
            1.0
        } else {
            flaky_tests.iter().map(|t| t.confidence()).sum::<f64>() / flaky_tests.len() as f64
        };

        Self {
            flaky_tests,
            total_tests_analyzed: total_tests,
            detection_confidence: confidence,
        }
    }

    pub fn summary(&self) -> String {
        format!(
            "Found {} flaky tests out of {} analyzed (confidence: {:.0}%)",
            self.flaky_tests.len(),
            self.total_tests_analyzed,
            self.detection_confidence * 100.0
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::TestCase;
    use std::path::PathBuf;

    fn create_test_case() -> TestCase {
        TestCase::new("test1", "test_addition", PathBuf::from("test.rs"), 10)
    }

    #[test]
    fn test_flaky_detection() {
        let mut detector = FlakyTestDetector::new();
        let test = create_test_case();

        for _ in 0..3 {
            detector.record_result(&TestExecutionResult::passed(&test, Duration::from_millis(100)));
        }
        for _ in 0..2 {
            detector.record_result(&TestExecutionResult::failed(&test, Duration::from_millis(100), "error"));
        }

        assert!(detector.is_flaky("test1"));
    }

    #[test]
    fn test_not_flaky_stable_pass() {
        let mut detector = FlakyTestDetector::new();
        let test = create_test_case();

        for _ in 0..10 {
            detector.record_result(&TestExecutionResult::passed(&test, Duration::from_millis(100)));
        }

        assert!(!detector.is_flaky("test1"));
    }

    #[test]
    fn test_suggest_retry() {
        let mut detector = FlakyTestDetector::new();
        let test = create_test_case();

        for _ in 0..10 {
            detector.record_result(&TestExecutionResult::passed(&test, Duration::from_millis(100)));
        }

        assert_eq!(detector.suggest_retry_count("test1"), 1);
    }
}
