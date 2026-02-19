use crate::error::TestingResult;
use crate::types::{ReportDiff, TestReport, TestRunResult};
use std::collections::HashSet;

pub struct DiffAnalyzer {
    baseline: Option<TestReport>,
}

impl DiffAnalyzer {
    pub fn new() -> Self {
        Self { baseline: None }
    }

    pub fn with_baseline(mut self, report: TestReport) -> Self {
        self.baseline = Some(report);
        self
    }

    pub fn set_baseline(&mut self, report: TestReport) {
        self.baseline = Some(report);
    }

    pub fn compare(&self, current: &TestReport) -> TestingResult<ReportDiff> {
        let baseline = self
            .baseline
            .as_ref()
            .ok_or_else(|| crate::error::TestingError::Other(anyhow::anyhow!("No baseline set")))?;

        let mut diff = ReportDiff::new(baseline.clone(), current.clone());

        let baseline_test_ids: HashSet<String> = baseline
            .run_result
            .suites
            .iter()
            .flat_map(|s| s.results.iter().map(|r| r.test_id.0.clone()))
            .collect();

        let current_test_ids: HashSet<String> = current
            .run_result
            .suites
            .iter()
            .flat_map(|s| s.results.iter().map(|r| r.test_id.0.clone()))
            .collect();

        diff.tests_added = current_test_ids
            .difference(&baseline_test_ids)
            .count();

        diff.tests_removed = baseline_test_ids
            .difference(&current_test_ids)
            .count();

        for suite in &baseline.run_result.suites {
            for result in &suite.results {
                if !result.is_success() {
                    let current_result = current
                        .run_result
                        .suites
                        .iter()
                        .flat_map(|s| &s.results)
                        .find(|r| r.test_id == result.test_id);

                    if let Some(cr) = current_result {
                        if cr.is_success() {
                            diff.tests_fixed += 1;
                        }
                    }
                }
            }
        }

        for suite in &current.run_result.suites {
            for result in &suite.results {
                if !result.is_success() {
                    let baseline_result = baseline
                        .run_result
                        .suites
                        .iter()
                        .flat_map(|s| &s.results)
                        .find(|r| r.test_id == result.test_id);

                    if let Some(br) = baseline_result {
                        if br.is_success() {
                            diff.tests_broken += 1;
                        }
                    }
                }
            }
        }

        if let (Some(b_cov), Some(c_cov)) = (&baseline.coverage, &current.coverage) {
            diff.coverage_delta = c_cov.overall_coverage() - b_cov.overall_coverage();
        }

        diff.duration_delta = current.duration.saturating_sub(baseline.duration);

        Ok(diff)
    }

    pub fn baseline(&self) -> Option<&TestReport> {
        self.baseline.as_ref()
    }
}

impl Default for DiffAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct TestDiff {
    pub added_tests: Vec<String>,
    pub removed_tests: Vec<String>,
    pub changed_results: Vec<ResultChange>,
}

#[derive(Debug, Clone)]
pub struct ResultChange {
    pub test_id: String,
    pub from_status: String,
    pub to_status: String,
}

impl TestDiff {
    pub fn new() -> Self {
        Self {
            added_tests: Vec::new(),
            removed_tests: Vec::new(),
            changed_results: Vec::new(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.added_tests.is_empty()
            && self.removed_tests.is_empty()
            && self.changed_results.is_empty()
    }

    pub fn summary(&self) -> String {
        let mut parts = Vec::new();

        if !self.added_tests.is_empty() {
            parts.push(format!("+{} tests", self.added_tests.len()));
        }
        if !self.removed_tests.is_empty() {
            parts.push(format!("-{} tests", self.removed_tests.len()));
        }
        if !self.changed_results.is_empty() {
            let fixed = self
                .changed_results
                .iter()
                .filter(|c| c.to_status == "passed")
                .count();
            let broken = self
                .changed_results
                .iter()
                .filter(|c| c.to_status != "passed")
                .count();

            if fixed > 0 {
                parts.push(format!("{} fixed", fixed));
            }
            if broken > 0 {
                parts.push(format!("{} broken", broken));
            }
        }

        if parts.is_empty() {
            "No changes".to_string()
        } else {
            parts.join(", ")
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{TestExecutionResult, TestSuiteResult};
    use std::path::PathBuf;
    use std::time::Duration;

    fn create_report(passed: usize, failed: usize) -> TestReport {
        let mut run_result = TestRunResult::new();
        let mut suite = TestSuiteResult::new("suite1", "Test Suite");

        let test = crate::types::TestCase::new("t1", "test", PathBuf::from("test.rs"), 1);

        for _ in 0..passed {
            suite.add_result(TestExecutionResult::passed(&test, Duration::from_millis(100)));
        }
        for _ in 0..failed {
            suite.add_result(TestExecutionResult::failed(&test, Duration::from_millis(100), "error"));
        }

        run_result.add_suite_result(suite);
        TestReport::new("Test Run", run_result)
    }

    #[test]
    fn test_diff_analyzer() {
        let baseline = create_report(2, 0);
        let current = create_report(1, 1);

        let analyzer = DiffAnalyzer::new().with_baseline(baseline);
        let diff = analyzer.compare(&current).unwrap();

        assert_eq!(diff.tests_broken, 1);
    }

    #[test]
    fn test_diff_analyzer_no_baseline() {
        let analyzer = DiffAnalyzer::new();
        let current = create_report(1, 0);

        assert!(analyzer.compare(&current).is_err());
    }

    #[test]
    fn test_test_diff() {
        let mut diff = TestDiff::new();
        diff.added_tests.push("test_new".to_string());
        diff.changed_results.push(ResultChange {
            test_id: "test1".to_string(),
            from_status: "failed".to_string(),
            to_status: "passed".to_string(),
        });

        assert!(!diff.is_empty());
        assert!(diff.summary().contains("+1 tests"));
    }
}
