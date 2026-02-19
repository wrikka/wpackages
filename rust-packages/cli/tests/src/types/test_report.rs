use super::{CoverageReport, TestRunResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestReport {
    pub id: String,
    pub name: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub duration: Duration,
    pub run_result: TestRunResult,
    pub coverage: Option<CoverageReport>,
    pub metadata: ReportMetadata,
}

impl TestReport {
    pub fn new(name: impl Into<String>, run_result: TestRunResult) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            timestamp: chrono::Utc::now(),
            duration: run_result.total_duration,
            run_result,
            coverage: None,
            metadata: ReportMetadata::default(),
        }
    }

    pub fn with_coverage(mut self, coverage: CoverageReport) -> Self {
        self.coverage = Some(coverage);
        self
    }

    pub fn with_metadata(mut self, metadata: ReportMetadata) -> Self {
        self.metadata = metadata;
        self
    }

    pub fn success_rate(&self) -> f64 {
        self.run_result.success_rate()
    }

    pub fn is_passed(&self) -> bool {
        self.run_result.is_all_passed()
    }

    pub fn summary(&self) -> String {
        let coverage_str = self
            .coverage
            .as_ref()
            .map(|c| format!(" | Coverage: {:.1}%", c.overall_coverage()))
            .unwrap_or_default();

        format!(
            "{}: {} tests, {:.1}% passed, {:?}{}",
            self.name,
            self.run_result.total_tests,
            self.success_rate() * 100.0,
            self.duration,
            coverage_str
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReportMetadata {
    pub branch: Option<String>,
    pub commit: Option<String>,
    pub author: Option<String>,
    pub ci_job_id: Option<String>,
    pub custom: std::collections::HashMap<String, String>,
}

impl ReportMetadata {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_branch(mut self, branch: impl Into<String>) -> Self {
        self.branch = Some(branch.into());
        self
    }

    pub fn with_commit(mut self, commit: impl Into<String>) -> Self {
        self.commit = Some(commit.into());
        self
    }

    pub fn with_author(mut self, author: impl Into<String>) -> Self {
        self.author = Some(author.into());
        self
    }

    pub fn with_ci_job(mut self, job_id: impl Into<String>) -> Self {
        self.ci_job_id = Some(job_id.into());
        self
    }

    pub fn with_custom(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.custom.insert(key.into(), value.into());
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportDiff {
    pub baseline: TestReport,
    pub current: TestReport,
    pub tests_added: usize,
    pub tests_removed: usize,
    pub tests_fixed: usize,
    pub tests_broken: usize,
    pub coverage_delta: f64,
    pub duration_delta: Duration,
}

impl ReportDiff {
    pub fn new(baseline: TestReport, current: TestReport) -> Self {
        Self {
            baseline,
            current,
            tests_added: 0,
            tests_removed: 0,
            tests_fixed: 0,
            tests_broken: 0,
            coverage_delta: 0.0,
            duration_delta: Duration::ZERO,
        }
    }

    pub fn is_improved(&self) -> bool {
        self.tests_fixed > self.tests_broken && self.coverage_delta >= 0.0
    }

    pub fn is_regressed(&self) -> bool {
        self.tests_broken > 0 || self.coverage_delta < -5.0
    }

    pub fn summary(&self) -> String {
        let direction = if self.is_improved() {
            "✓ Improved"
        } else if self.is_regressed() {
            "✗ Regressed"
        } else {
            "~ No change"
        };

        format!(
            "{}: +{} -{} tests, {} fixed, {} broken, {:.1}% coverage",
            direction,
            self.tests_added,
            self.tests_removed,
            self.tests_fixed,
            self.tests_broken,
            self.coverage_delta
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JUnitTestSuite {
    pub name: String,
    pub tests: usize,
    pub failures: usize,
    pub errors: usize,
    pub skipped: usize,
    pub time: f64,
    pub test_cases: Vec<JUnitTestCase>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JUnitTestCase {
    pub name: String,
    pub classname: String,
    pub time: f64,
    pub result: JUnitResult,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JUnitResult {
    Passed,
    Failed { message: String },
    Error { message: String },
    Skipped { message: String },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_report_creation() {
        let run_result = TestRunResult::new();
        let report = TestReport::new("Test Run", run_result);

        assert!(!report.id.is_empty());
        assert_eq!(report.name, "Test Run");
    }

    #[test]
    fn test_metadata() {
        let meta = ReportMetadata::new()
            .with_branch("main")
            .with_commit("abc123")
            .with_author("test");

        assert_eq!(meta.branch, Some("main".to_string()));
        assert_eq!(meta.commit, Some("abc123".to_string()));
    }
}
