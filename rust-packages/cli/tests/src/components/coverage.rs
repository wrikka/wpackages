use crate::error::{TestingError, TestingResult};
use crate::types::{CoverageHeatmap, CoverageReport, LineCoverage, TestCoverage};
use std::collections::HashMap;
use std::path::PathBuf;
use tracing::{debug, info};

pub struct CoverageCollector {
    files: HashMap<PathBuf, FileCoverage>,
    enabled: bool,
}

#[derive(Debug, Clone)]
struct FileCoverage {
    lines: HashMap<usize, usize>,
    branches: HashMap<usize, (usize, usize)>,
    functions: HashMap<String, bool>,
}

impl CoverageCollector {
    pub fn new() -> Self {
        Self {
            files: HashMap::new(),
            enabled: true,
        }
    }

    pub fn enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    pub fn record_line(&mut self, file: &PathBuf, line: usize) {
        if !self.enabled {
            return;
        }

        let coverage = self.files.entry(file.clone()).or_insert_with(|| FileCoverage {
            lines: HashMap::new(),
            branches: HashMap::new(),
            functions: HashMap::new(),
        });

        *coverage.lines.entry(line).or_insert(0) += 1;
        debug!("Recorded line {} in {:?}", line, file);
    }

    pub fn record_branch(&mut self, file: &PathBuf, branch_id: usize, taken: bool) {
        if !self.enabled {
            return;
        }

        let coverage = self.files.entry(file.clone()).or_insert_with(|| FileCoverage {
            lines: HashMap::new(),
            branches: HashMap::new(),
            functions: HashMap::new(),
        });

        let (taken_count, total) = coverage.branches.entry(branch_id).or_insert((0, 0));
        *total += 1;
        if taken {
            *taken_count += 1;
        }
    }

    pub fn record_function(&mut self, file: &PathBuf, function: &str, covered: bool) {
        if !self.enabled {
            return;
        }

        let coverage = self.files.entry(file.clone()).or_insert_with(|| FileCoverage {
            lines: HashMap::new(),
            branches: HashMap::new(),
            functions: HashMap::new(),
        });

        coverage.functions.insert(function.to_string(), covered);
    }

    pub fn get_file_coverage(&self, file: &PathBuf) -> Option<TestCoverage> {
        let fc = self.files.get(file)?;

        let lines_covered: Vec<usize> = fc.lines.keys().copied().collect();
        let lines_uncovered: Vec<usize> = Vec::new();

        let branches_covered = fc.branches.values().map(|(t, _)| *t).sum();
        let branches_total: usize = fc.branches.values().map(|(_, t)| *t).sum();

        let functions_covered: Vec<String> = fc
            .functions
            .iter()
            .filter(|(_, &c)| c)
            .map(|(f, _)| f.clone())
            .collect();
        let functions_uncovered: Vec<String> = fc
            .functions
            .iter()
            .filter(|(_, &c)| !c)
            .map(|(f, _)| f.clone())
            .collect();

        Some(TestCoverage::new(file.clone())
            .with_lines(lines_covered, lines_uncovered)
            .with_branches(branches_covered, branches_total)
            .with_functions(functions_covered, functions_uncovered))
    }

    pub fn generate_report(&self) -> CoverageReport {
        let files: Vec<TestCoverage> = self
            .files
            .keys()
            .filter_map(|f| self.get_file_coverage(f))
            .collect();

        CoverageReport::new(files)
    }

    pub fn generate_heatmap(&self, file: &PathBuf) -> Option<CoverageHeatmap> {
        let fc = self.files.get(file)?;
        let max_line = fc.lines.keys().max().copied().unwrap_or(0);

        let lines: Vec<LineCoverage> = (1..=max_line)
            .map(|line| {
                let hits = fc.lines.get(&line).copied().unwrap_or(0);
                if hits == 0 {
                    LineCoverage::Uncovered
                } else if hits < 5 {
                    LineCoverage::Partial
                } else {
                    LineCoverage::Covered
                }
            })
            .collect();

        Some(CoverageHeatmap {
            file_path: file.clone(),
            lines,
        })
    }

    pub fn merge(&mut self, other: &CoverageCollector) {
        for (file, coverage) in &other.files {
            let self_coverage = self.files.entry(file.clone()).or_insert_with(|| FileCoverage {
                lines: HashMap::new(),
                branches: HashMap::new(),
                functions: HashMap::new(),
            });

            for (line, hits) in &coverage.lines {
                *self_coverage.lines.entry(*line).or_insert(0) += hits;
            }

            for (branch, (taken, total)) in &coverage.branches {
                let (self_taken, self_total) = self_coverage
                    .branches
                    .entry(*branch)
                    .or_insert((0, 0));
                *self_taken += taken;
                *self_total += total;
            }

            for (func, covered) in &coverage.functions {
                self_coverage
                    .functions
                    .insert(func.clone(), *covered || self_coverage.functions.get(func).copied().unwrap_or(false));
            }
        }
    }

    pub fn clear(&mut self) {
        self.files.clear();
    }

    pub fn file_count(&self) -> usize {
        self.files.len()
    }

    pub fn total_lines(&self) -> usize {
        self.files.values().map(|f| f.lines.len()).sum()
    }
}

impl Default for CoverageCollector {
    fn default() -> Self {
        Self::new()
    }
}

pub struct CoverageThreshold {
    pub line: f64,
    pub branch: f64,
    pub function: f64,
}

impl Default for CoverageThreshold {
    fn default() -> Self {
        Self {
            line: 80.0,
            branch: 70.0,
            function: 80.0,
        }
    }
}

impl CoverageThreshold {
    pub fn new(line: f64, branch: f64, function: f64) -> Self {
        Self {
            line,
            branch,
            function,
        }
    }

    pub fn check(&self, report: &CoverageReport) -> CoverageCheckResult {
        let mut failures = Vec::new();

        if report.total_line_coverage < self.line {
            failures.push(format!(
                "Line coverage {:.1}% below threshold {:.1}%",
                report.total_line_coverage, self.line
            ));
        }

        if report.total_branch_coverage < self.branch {
            failures.push(format!(
                "Branch coverage {:.1}% below threshold {:.1}%",
                report.total_branch_coverage, self.branch
            ));
        }

        if report.total_function_coverage < self.function {
            failures.push(format!(
                "Function coverage {:.1}% below threshold {:.1}%",
                report.total_function_coverage, self.function
            ));
        }

        CoverageCheckResult {
            passed: failures.is_empty(),
            failures,
        }
    }
}

#[derive(Debug, Clone)]
pub struct CoverageCheckResult {
    pub passed: bool,
    pub failures: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_coverage_collector() {
        let mut collector = CoverageCollector::new();
        let file = PathBuf::from("test.rs");

        collector.record_line(&file, 10);
        collector.record_line(&file, 11);
        collector.record_line(&file, 10);

        let coverage = collector.get_file_coverage(&file).unwrap();
        assert!(!coverage.lines_covered.is_empty());
    }

    #[test]
    fn test_coverage_report() {
        let mut collector = CoverageCollector::new();
        let file = PathBuf::from("test.rs");

        collector.record_line(&file, 10);
        collector.record_function(&file, "main", true);

        let report = collector.generate_report();

        assert_eq!(report.files.len(), 1);
    }

    #[test]
    fn test_coverage_threshold() {
        let threshold = CoverageThreshold::new(80.0, 70.0, 80.0);

        let report = CoverageReport::new(vec![]);

        let result = threshold.check(&report);
        assert!(!result.passed);
    }
}
