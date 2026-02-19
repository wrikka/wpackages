use crate::error::{TestingError, TestingResult};
use crate::types::{TestCase, TestSuite, TestFramework};
use glob::glob;
use regex::Regex;
use std::path::{Path, PathBuf};
use tracing::{debug, info, warn};

/// Test discovery
pub struct TestDiscovery {
    patterns: Vec<String>,
    frameworks: Vec<TestFramework>,
}

impl TestDiscovery {
    pub fn new() -> Self {
        Self {
            patterns: vec![
                "**/*test*.rs".to_string(),
                "**/tests/**/*.rs".to_string(),
                "**/test_*.rs".to_string(),
                "**/*_test.rs".to_string(),
            ],
            frameworks: vec![
                TestFramework::Rust,
                TestFramework::JavaScript,
                TestFramework::TypeScript,
                TestFramework::Python,
            ],
        }
    }

    pub fn with_patterns(mut self, patterns: Vec<String>) -> Self {
        self.patterns = patterns;
        self
    }

    pub fn with_frameworks(mut self, frameworks: Vec<TestFramework>) -> Self {
        self.frameworks = frameworks;
        self
    }

    pub async fn discover(&self, root: &Path) -> TestingResult<Vec<TestSuite>> {
        info!("Discovering tests in {:?}", root);

        let mut suites = Vec::new();

        for pattern in &self.patterns {
            let pattern_path = root.join(pattern);

            debug!("Searching for pattern: {:?}", pattern_path);

            match glob(&pattern_path.to_string_lossy()) {
                Ok(entries) => {
                    for entry in entries {
                        if let Ok(path) = entry {
                            if path.is_file() {
                                if let Some(suite) = self.parse_file(&path)? {
                                    suites.push(suite);
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    warn!("Failed to glob pattern {:?}: {}", pattern, e);
                }
            }
        }

        info!("Discovered {} test suites", suites.len());

        Ok(suites)
    }

    fn parse_file(&self, path: &Path) -> TestingResult<Option<TestSuite>> {
        let content = std::fs::read_to_string(path)?;

        let framework = self.detect_framework(&content, path)?;

        if framework.is_none() {
            return Ok(None);
        }

        let framework = framework.unwrap();

        let test_cases = match framework {
            TestFramework::Rust => self.parse_rust_tests(&content, path)?,
            TestFramework::JavaScript | TestFramework::TypeScript => self.parse_js_tests(&content, path)?,
            TestFramework::Python => self.parse_python_tests(&content, path)?,
            TestFramework::Go | TestFramework::Java | TestFramework::DotNet => Vec::new(),
            TestFramework::Custom(_) => Vec::new(),
        };

        if test_cases.is_empty() {
            return Ok(None);
        }

        let suite_id = path.to_string_lossy().replace('\\', "/");
        let suite_name = path.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Test Suite");

        let suite = TestSuite::new(suite_id, suite_name, path.to_path_buf())
            .with_test_cases(test_cases);

        debug!("Parsed test suite: {} with {} tests", suite.name, suite.test_count());

        Ok(Some(suite))
    }

    fn detect_framework(&self, _content: &str, path: &Path) -> TestingResult<Option<TestFramework>> {
        let ext = path.extension().and_then(|s| s.to_str());

        match ext {
            Some("rs") => Ok(Some(TestFramework::Rust)),
            Some("js") => Ok(Some(TestFramework::JavaScript)),
            Some("ts") | Some("tsx") => Ok(Some(TestFramework::TypeScript)),
            Some("py") => Ok(Some(TestFramework::Python)),
            _ => Ok(None),
        }
    }

    fn parse_rust_tests(&self, content: &str, path: &Path) -> TestingResult<Vec<TestCase>> {
        let mut test_cases = Vec::new();
        let lines: Vec<&str> = content.lines().collect();

        let test_fn_regex = Regex::new(r"#\[test\]\s*fn\s+(\w+)\s*\(")
            .map_err(|e| TestingError::discovery_error(format!("Regex error: {}", e)))?;
        let test_mod_regex = Regex::new(r"#\[test\]\s*mod\s+(\w+)")
            .map_err(|e| TestingError::discovery_error(format!("Regex error: {}", e)))?;

        for (line_idx, line) in lines.iter().enumerate() {
            if let Some(caps) = test_fn_regex.captures(line) {
                let name = caps.get(1).map(|m| m.as_str()).unwrap_or("unknown");
                let id = format!("{}::{}", path.display(), name);

                let test_case = TestCase::new(&id, name, path.to_path_buf(), line_idx + 1)
                    .with_tag("unit");

                test_cases.push(test_case);
            }

            if let Some(caps) = test_mod_regex.captures(line) {
                let name = caps.get(1).map(|m| m.as_str()).unwrap_or("unknown");
                let id = format!("{}::{}", path.display(), name);

                let test_case = TestCase::new(&id, name, path.to_path_buf(), line_idx + 1)
                    .with_tag("integration");

                test_cases.push(test_case);
            }
        }

        Ok(test_cases)
    }

    fn parse_js_tests(&self, content: &str, path: &Path) -> TestingResult<Vec<TestCase>> {
        let mut test_cases = Vec::new();
        let lines: Vec<&str> = content.lines().collect();

        let test_regex = Regex::new(r"(?:test|it)\s*\(\s*[\x27\x22]([^\x27\x22]+)[\x27\x22]")
            .map_err(|e| TestingError::discovery_error(format!("Regex error: {}", e)))?;
        let describe_regex = Regex::new(r"(?:describe|context|suite)\s*\(\s*[\x27\x22]([^\x27\x22]+)[\x27\x22]")
            .map_err(|e| TestingError::discovery_error(format!("Regex error: {}", e)))?;

        for (line_idx, line) in lines.iter().enumerate() {
            if let Some(caps) = test_regex.captures(line) {
                let name = caps.get(1).map(|m| m.as_str()).unwrap_or("unknown");
                let id = format!("{}::{}", path.display(), name);

                let test_case = TestCase::new(&id, name, path.to_path_buf(), line_idx + 1)
                    .with_tag("unit");

                test_cases.push(test_case);
            }

            if let Some(caps) = describe_regex.captures(line) {
                let name = caps.get(1).map(|m| m.as_str()).unwrap_or("unknown");
                let id = format!("{}::{}", path.display(), name);

                let test_case = TestCase::new(&id, name, path.to_path_buf(), line_idx + 1)
                    .with_tag("integration");

                test_cases.push(test_case);
            }
        }

        Ok(test_cases)
    }

    fn parse_python_tests(&self, content: &str, path: &Path) -> TestingResult<Vec<TestCase>> {
        let mut test_cases = Vec::new();
        let lines: Vec<&str> = content.lines().collect();

        let test_regex = Regex::new(r"def\s+(test_\w+)\s*\(")
            .map_err(|e| TestingError::discovery_error(format!("Regex error: {}", e)))?;
        let class_regex = Regex::new(r"class\s+(Test\w+)")
            .map_err(|e| TestingError::discovery_error(format!("Regex error: {}", e)))?;

        for (line_idx, line) in lines.iter().enumerate() {
            if let Some(caps) = test_regex.captures(line) {
                let name = caps.get(1).map(|m| m.as_str()).unwrap_or("unknown");
                let id = format!("{}::{}", path.display(), name);

                let test_case = TestCase::new(&id, name, path.to_path_buf(), line_idx + 1)
                    .with_tag("unit");

                test_cases.push(test_case);
            }

            if let Some(caps) = class_regex.captures(line) {
                let name = caps.get(1).map(|m| m.as_str()).unwrap_or("unknown");
                let id = format!("{}::{}", path.display(), name);

                let test_case = TestCase::new(&id, name, path.to_path_buf(), line_idx + 1)
                    .with_tag("integration");

                test_cases.push(test_case);
            }
        }

        Ok(test_cases)
    }

    pub async fn discover_file(&self, path: &Path) -> TestingResult<Option<TestSuite>> {
        self.parse_file(path)
    }

    pub fn filter_by_tags(&self, suites: Vec<TestSuite>, tags: &[&str]) -> Vec<TestSuite> {
        suites
            .into_iter()
            .filter(|suite| {
                suite
                    .test_cases
                    .iter()
                    .any(|test| tags.iter().any(|tag| test.has_tag(tag)))
            })
            .collect()
    }

    pub fn filter_by_pattern(&self, suites: Vec<TestSuite>, pattern: &str) -> TestingResult<Vec<TestSuite>> {
        let regex = Regex::new(pattern)
            .map_err(|e| TestingError::discovery_error(format!("Invalid regex: {}", e)))?;
        let mut filtered = Vec::new();

        for suite in suites {
            let filtered_cases: Vec<_> = suite
                .test_cases
                .iter()
                .filter(|tc| regex.is_match(&tc.name))
                .cloned()
                .collect();

            if !filtered_cases.is_empty() {
                let mut filtered_suite = suite.clone();
                filtered_suite.test_cases = filtered_cases;
                filtered.push(filtered_suite);
            }
        }

        Ok(filtered)
    }
}

impl Default for TestDiscovery {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_discovery() {
        let discovery = TestDiscovery::new();

        let temp_dir = tempfile::tempdir().unwrap();
        let test_file = temp_dir.path().join("test.rs");

        std::fs::write(
            &test_file,
            r#"
#[test]
fn test_addition() {
    assert_eq!(2 + 2, 4);
}

#[test]
fn test_subtraction() {
    assert_eq!(5 - 3, 2);
}
"#,
        )
        .unwrap();

        let suites = discovery.discover(temp_dir.path()).await.unwrap();

        assert_eq!(suites.len(), 1);
        assert_eq!(suites[0].test_count(), 2);
    }

    #[test]
    fn test_filter_by_tags() {
        let file = PathBuf::from("test.rs");
        let mut suite = TestSuite::new("suite1", "Test Suite 1", file);

        let tc1 = TestCase::new("test1", "test 1", PathBuf::from("test.rs"), 1)
            .with_tag("unit");
        let tc2 = TestCase::new("test2", "test 2", PathBuf::from("test.rs"), 2)
            .with_tag("integration");

        suite.add_test_case(tc1);
        suite.add_test_case(tc2);

        let discovery = TestDiscovery::new();
        let filtered = discovery.filter_by_tags(vec![suite], &["unit"]);

        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].test_count(), 1);
    }
}
