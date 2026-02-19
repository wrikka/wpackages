use super::{TestCase, TestCaseId};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSuite {
    pub id: String,
    pub name: String,
    pub file_path: PathBuf,
    pub test_cases: Vec<TestCase>,
    pub setup: Option<String>,
    pub teardown: Option<String>,
    pub tags: Vec<String>,
}

impl TestSuite {
    pub fn new(id: impl Into<String>, name: impl Into<String>, file_path: PathBuf) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            file_path,
            test_cases: Vec::new(),
            setup: None,
            teardown: None,
            tags: Vec::new(),
        }
    }

    pub fn with_test_cases(mut self, test_cases: Vec<TestCase>) -> Self {
        self.test_cases = test_cases;
        self
    }

    pub fn with_setup(mut self, setup: impl Into<String>) -> Self {
        self.setup = Some(setup.into());
        self
    }

    pub fn with_teardown(mut self, teardown: impl Into<String>) -> Self {
        self.teardown = Some(teardown.into());
        self
    }

    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }

    pub fn test_count(&self) -> usize {
        self.test_cases.len()
    }

    pub fn is_empty(&self) -> bool {
        self.test_cases.is_empty()
    }

    pub fn add_test_case(&mut self, test_case: TestCase) {
        self.test_cases.push(test_case);
    }

    pub fn get_test_case(&self, id: &TestCaseId) -> Option<&TestCase> {
        self.test_cases.iter().find(|t| &t.id == id)
    }

    pub fn get_test_case_mut(&mut self, id: &TestCaseId) -> Option<&mut TestCase> {
        self.test_cases.iter_mut().find(|t| &t.id == id)
    }

    pub fn filter_by_tag(&self, tag: &str) -> Vec<&TestCase> {
        self.test_cases.iter().filter(|t| t.has_tag(tag)).collect()
    }

    pub fn filter_by_tags(&self, tags: &[String]) -> Vec<&TestCase> {
        self.test_cases
            .iter()
            .filter(|t| tags.iter().any(|tag| t.has_tag(tag)))
            .collect()
    }

    pub fn filter_skipped(&self, skipped: bool) -> Vec<&TestCase> {
        self.test_cases
            .iter()
            .filter(|t| t.is_skipped() == skipped)
            .collect()
    }

    pub fn filter_flaky(&self) -> Vec<&TestCase> {
        self.test_cases.iter().filter(|t| t.is_flaky()).collect()
    }

    pub fn filter_slow(&self) -> Vec<&TestCase> {
        self.test_cases.iter().filter(|t| t.is_slow()).collect()
    }

    pub fn has_tag(&self, tag: &str) -> bool {
        self.tags.iter().any(|t| t == tag)
    }

    pub fn all_dependencies(&self) -> Vec<TestCaseId> {
        self.test_cases
            .iter()
            .flat_map(|t| t.dependencies.clone())
            .collect()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSuiteCollection {
    pub suites: Vec<TestSuite>,
}

impl TestSuiteCollection {
    pub fn new() -> Self {
        Self {
            suites: Vec::new(),
        }
    }

    pub fn with_suites(suites: Vec<TestSuite>) -> Self {
        Self { suites }
    }

    pub fn add_suite(&mut self, suite: TestSuite) {
        self.suites.push(suite);
    }

    pub fn total_tests(&self) -> usize {
        self.suites.iter().map(|s| s.test_count()).sum()
    }

    pub fn is_empty(&self) -> bool {
        self.suites.is_empty() || self.total_tests() == 0
    }

    pub fn all_test_cases(&self) -> Vec<&TestCase> {
        self.suites.iter().flat_map(|s| &s.test_cases).collect()
    }

    pub fn find_test(&self, id: &TestCaseId) -> Option<&TestCase> {
        self.suites
            .iter()
            .find_map(|s| s.get_test_case(id))
    }

    pub fn filter_by_tag(&self, tag: &str) -> Self {
        let suites: Vec<TestSuite> = self
            .suites
            .iter()
            .filter_map(|s| {
                let filtered_cases: Vec<TestCase> = s
                    .test_cases
                    .iter()
                    .filter(|t| t.has_tag(tag))
                    .cloned()
                    .collect();
                if filtered_cases.is_empty() {
                    None
                } else {
                    let mut filtered_suite = s.clone();
                    filtered_suite.test_cases = filtered_cases;
                    Some(filtered_suite)
                }
            })
            .collect();
        Self::with_suites(suites)
    }
}

impl Default for TestSuiteCollection {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn test_suite_creation() {
        let suite = TestSuite::new("suite1", "Test Suite", PathBuf::from("test.rs"))
            .with_tag("integration")
            .with_setup("setup_fn");

        assert_eq!(suite.id, "suite1");
        assert!(suite.has_tag("integration"));
    }

    #[test]
    fn test_suite_add_cases() {
        let mut suite = TestSuite::new("suite1", "Suite", PathBuf::from("test.rs"));

        let tc1 = TestCase::new("t1", "test1", PathBuf::from("test.rs"), 1);
        let tc2 = TestCase::new("t2", "test2", PathBuf::from("test.rs"), 10);

        suite.add_test_case(tc1);
        suite.add_test_case(tc2);

        assert_eq!(suite.test_count(), 2);
    }

    #[test]
    fn test_suite_filter() {
        let suite = TestSuite::new("suite1", "Suite", PathBuf::from("test.rs"))
            .with_test_cases(vec![
                TestCase::new("t1", "test1", PathBuf::from("test.rs"), 1).with_tag("unit"),
                TestCase::new("t2", "test2", PathBuf::from("test.rs"), 10).with_tag("integration"),
            ]);

        let unit_tests = suite.filter_by_tag("unit");
        assert_eq!(unit_tests.len(), 1);
    }

    #[test]
    fn test_suite_collection() {
        let mut collection = TestSuiteCollection::new();

        let suite = TestSuite::new("s1", "Suite", PathBuf::from("test.rs"))
            .with_test_cases(vec![
                TestCase::new("t1", "test1", PathBuf::from("test.rs"), 1),
            ]);

        collection.add_suite(suite);
        assert_eq!(collection.total_tests(), 1);
    }
}
