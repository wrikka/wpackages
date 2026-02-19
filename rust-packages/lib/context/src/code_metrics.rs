use anyhow::Result;
use std::collections::HashMap;

/// Code metrics analyzer for quality analysis
pub struct CodeMetricsAnalyzer {
    metrics: HashMap<String, FileMetrics>,
}

impl CodeMetricsAnalyzer {
    /// Creates a new code metrics analyzer
    pub fn new() -> Self {
        Self {
            metrics: HashMap::new(),
        }
    }

    /// Analyzes code metrics for a file
    pub fn analyze_file(&mut self, file_path: &str, source: &str) -> Result<FileMetrics> {
        let lines = source.lines().count();
        let code_lines = source
            .lines()
            .filter(|l| !l.trim().is_empty() && !l.trim().starts_with("//"))
            .count();
        let comment_lines = source
            .lines()
            .filter(|l| l.trim().starts_with("//"))
            .count();
        let blank_lines = source.lines().filter(|l| l.trim().is_empty()).count();

        let functions = self.count_functions(source)?;
        let classes = self.count_classes(source)?;
        let complexity = self.calculate_cyclomatic_complexity(source)?;

        let metrics = FileMetrics {
            file_path: file_path.to_string(),
            total_lines: lines,
            code_lines,
            comment_lines,
            blank_lines,
            functions,
            classes,
            complexity,
            maintainability_index: self.calculate_maintainability_index(
                code_lines,
                complexity,
                functions,
                comment_lines,
            ),
        };

        self.metrics.insert(file_path.to_string(), metrics.clone());
        Ok(metrics)
    }

    /// Gets metrics for a file
    pub fn get_metrics(&self, file_path: &str) -> Option<&FileMetrics> {
        self.metrics.get(file_path)
    }

    /// Gets all metrics
    pub fn get_all_metrics(&self) -> &HashMap<String, FileMetrics> {
        &self.metrics
    }

    /// Gets quality report
    pub fn get_quality_report(&self) -> QualityReport {
        let total_files = self.metrics.len();
        let total_lines: usize = self.metrics.values().map(|m| m.total_lines).sum();
        let total_code_lines: usize = self.metrics.values().map(|m| m.code_lines).sum();
        let avg_complexity: f64 = if total_files > 0 {
            self.metrics.values().map(|m| m.complexity).sum::<f64>() / total_files as f64
        } else {
            0.0
        };

        let high_complexity_files: Vec<&FileMetrics> = self
            .metrics
            .values()
            .filter(|m| m.complexity > 10.0)
            .collect();

        QualityReport {
            total_files,
            total_lines,
            total_code_lines,
            avg_complexity,
            high_complexity_files: high_complexity_files.len(),
            high_complexity_file_names: high_complexity_files
                .iter()
                .map(|m| m.file_path.clone())
                .collect(),
        }
    }

    fn count_functions(&self, source: &str) -> Result<usize> {
        let count = source.matches("fn ").count() + source.matches("function ").count();
        Ok(count)
    }

    fn count_classes(&self, source: &str) -> Result<usize> {
        let count = source.matches("struct ").count() + source.matches("class ").count();
        Ok(count)
    }

    fn calculate_cyclomatic_complexity(&self, source: &str) -> Result<f64> {
        let mut complexity = 1.0;

        for line in source.lines() {
            if line.trim().contains("if ")
                || line.trim().contains("else if ")
                || line.trim().contains("for ")
                || line.trim().contains("while ")
                || line.trim().contains("match ")
                || line.trim().contains("&&")
                || line.trim().contains("||")
            {
                complexity += 1.0;
            }
        }

        Ok(complexity)
    }

    fn calculate_maintainability_index(
        &self,
        code_lines: usize,
        complexity: f64,
        _functions: usize,
        _comment_lines: usize,
    ) -> f64 {
        if code_lines == 0 {
            return 100.0;
        }

        let volume = code_lines as f64 * (code_lines as f64).log2();
        let effort = volume * complexity;
        let mi =
            171.0 - 5.2 * effort.log2() - 0.23 * complexity - 16.2 * (code_lines as f64).log2();

        mi.max(0.0).min(100.0)
    }
}

impl Default for CodeMetricsAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

/// File metrics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct FileMetrics {
    pub file_path: String,
    pub total_lines: usize,
    pub code_lines: usize,
    pub comment_lines: usize,
    pub blank_lines: usize,
    pub functions: usize,
    pub classes: usize,
    pub complexity: f64,
    pub maintainability_index: f64,
}

/// Quality report
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QualityReport {
    pub total_files: usize,
    pub total_lines: usize,
    pub total_code_lines: usize,
    pub avg_complexity: f64,
    pub high_complexity_files: usize,
    pub high_complexity_file_names: Vec<String>,
}
