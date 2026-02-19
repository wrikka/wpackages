use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCoverage {
    pub file_path: PathBuf,
    pub lines_covered: Vec<usize>,
    pub lines_uncovered: Vec<usize>,
    pub branches_covered: usize,
    pub branches_total: usize,
    pub functions_covered: Vec<String>,
    pub functions_uncovered: Vec<String>,
}

impl TestCoverage {
    pub fn new(file_path: PathBuf) -> Self {
        Self {
            file_path,
            lines_covered: Vec::new(),
            lines_uncovered: Vec::new(),
            branches_covered: 0,
            branches_total: 0,
            functions_covered: Vec::new(),
            functions_uncovered: Vec::new(),
        }
    }

    pub fn with_lines(mut self, covered: Vec<usize>, uncovered: Vec<usize>) -> Self {
        self.lines_covered = covered;
        self.lines_uncovered = uncovered;
        self
    }

    pub fn with_branches(mut self, covered: usize, total: usize) -> Self {
        self.branches_covered = covered;
        self.branches_total = total;
        self
    }

    pub fn with_functions(mut self, covered: Vec<String>, uncovered: Vec<String>) -> Self {
        self.functions_covered = covered;
        self.functions_uncovered = uncovered;
        self
    }

    pub fn line_coverage(&self) -> f64 {
        let total = self.lines_covered.len() + self.lines_uncovered.len();
        if total == 0 {
            0.0
        } else {
            (self.lines_covered.len() as f64 / total as f64) * 100.0
        }
    }

    pub fn branch_coverage(&self) -> f64 {
        if self.branches_total == 0 {
            0.0
        } else {
            (self.branches_covered as f64 / self.branches_total as f64) * 100.0
        }
    }

    pub fn function_coverage(&self) -> f64 {
        let total = self.functions_covered.len() + self.functions_uncovered.len();
        if total == 0 {
            0.0
        } else {
            (self.functions_covered.len() as f64 / total as f64) * 100.0
        }
    }

    pub fn total_coverage(&self) -> f64 {
        let line = self.line_coverage();
        let branch = self.branch_coverage();
        let func = self.function_coverage();
        (line + branch + func) / 3.0
    }

    pub fn total_lines(&self) -> usize {
        self.lines_covered.len() + self.lines_uncovered.len()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageReport {
    pub files: Vec<TestCoverage>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub total_line_coverage: f64,
    pub total_branch_coverage: f64,
    pub total_function_coverage: f64,
}

impl CoverageReport {
    pub fn new(files: Vec<TestCoverage>) -> Self {
        let total_line = if files.is_empty() {
            0.0
        } else {
            files.iter().map(|f| f.line_coverage()).sum::<f64>() / files.len() as f64
        };

        let total_branch = if files.is_empty() {
            0.0
        } else {
            files.iter().map(|f| f.branch_coverage()).sum::<f64>() / files.len() as f64
        };

        let total_func = if files.is_empty() {
            0.0
        } else {
            files.iter().map(|f| f.function_coverage()).sum::<f64>() / files.len() as f64
        };

        Self {
            files,
            timestamp: chrono::Utc::now(),
            total_line_coverage: total_line,
            total_branch_coverage: total_branch,
            total_function_coverage: total_func,
        }
    }

    pub fn overall_coverage(&self) -> f64 {
        (self.total_line_coverage + self.total_branch_coverage + self.total_function_coverage) / 3.0
    }

    pub fn files_below_threshold(&self, threshold: f64) -> Vec<&TestCoverage> {
        self.files.iter().filter(|f| f.total_coverage() < threshold).collect()
    }

    pub fn uncovered_files(&self) -> Vec<&TestCoverage> {
        self.files.iter().filter(|f| f.total_coverage() == 0.0).collect()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageHeatmap {
    pub file_path: PathBuf,
    pub lines: Vec<LineCoverage>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LineCoverage {
    Covered,
    Uncovered,
    Partial,
    NotExecutable,
}

impl LineCoverage {
    pub fn color(&self) -> &'static str {
        match self {
            Self::Covered => "green",
            Self::Uncovered => "red",
            Self::Partial => "yellow",
            Self::NotExecutable => "gray",
        }
    }

    pub fn ansi_color(&self) -> &'static str {
        match self {
            Self::Covered => "\x1b[32m",
            Self::Uncovered => "\x1b[31m",
            Self::Partial => "\x1b[33m",
            Self::NotExecutable => "\x1b[90m",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_coverage_calculation() {
        let coverage = TestCoverage::new(PathBuf::from("test.rs"))
            .with_lines(vec![1, 2, 3], vec![4, 5])
            .with_branches(3, 4)
            .with_functions(vec!["main".into()], vec!["helper".into()]);

        assert!((coverage.line_coverage() - 60.0).abs() < 0.01);
        assert!((coverage.branch_coverage() - 75.0).abs() < 0.01);
        assert!((coverage.function_coverage() - 50.0).abs() < 0.01);
    }

    #[test]
    fn test_coverage_report() {
        let report = CoverageReport::new(vec![
            TestCoverage::new(PathBuf::from("a.rs")).with_lines(vec![1], vec![]),
            TestCoverage::new(PathBuf::from("b.rs")).with_lines(vec![], vec![1]),
        ]);

        assert!((report.total_line_coverage - 50.0).abs() < 0.01);
    }
}
