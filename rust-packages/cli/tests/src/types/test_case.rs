use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::Duration;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TestCaseId(pub String);

impl TestCaseId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for TestCaseId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<String> for TestCaseId {
    fn from(value: String) -> Self {
        Self(value)
    }
}

impl From<&str> for TestCaseId {
    fn from(value: &str) -> Self {
        Self(value.to_string())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum TestPriority {
    #[default]
    Normal,
    Low,
    High,
    Critical,
}

impl PartialOrd for TestPriority {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for TestPriority {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        let order = |p: &Self| match p {
            Self::Low => 0,
            Self::Normal => 1,
            Self::High => 2,
            Self::Critical => 3,
        };
        order(self).cmp(&order(other))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TestFramework {
    Rust,
    JavaScript,
    TypeScript,
    Python,
    Go,
    Java,
    DotNet,
    Custom(String),
}

impl TestFramework {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Rust => "rust",
            Self::JavaScript => "javascript",
            Self::TypeScript => "typescript",
            Self::Python => "python",
            Self::Go => "go",
            Self::Java => "java",
            Self::DotNet => "dotnet",
            Self::Custom(name) => name,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCase {
    pub id: TestCaseId,
    pub name: String,
    pub file_path: PathBuf,
    pub line: usize,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub timeout: Option<Duration>,
    pub priority: TestPriority,
    pub framework: TestFramework,
    pub skip_reason: Option<String>,
    pub flaky: bool,
    pub slow: bool,
    pub dependencies: Vec<TestCaseId>,
}

impl TestCase {
    pub fn new(id: impl Into<String>, name: impl Into<String>, file_path: PathBuf, line: usize) -> Self {
        Self {
            id: TestCaseId::new(id),
            name: name.into(),
            file_path,
            line,
            description: None,
            tags: Vec::new(),
            timeout: None,
            priority: TestPriority::default(),
            framework: TestFramework::Rust,
            skip_reason: None,
            flaky: false,
            slow: false,
            dependencies: Vec::new(),
        }
    }

    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }

    pub fn with_tag(mut self, tag: impl Into<String>) -> Self {
        self.tags.push(tag.into());
        self
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }

    pub fn with_priority(mut self, priority: TestPriority) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_framework(mut self, framework: TestFramework) -> Self {
        self.framework = framework;
        self
    }

    pub fn with_skip_reason(mut self, reason: impl Into<String>) -> Self {
        self.skip_reason = Some(reason.into());
        self
    }

    pub fn with_flaky(mut self, flaky: bool) -> Self {
        self.flaky = flaky;
        self
    }

    pub fn with_slow(mut self, slow: bool) -> Self {
        self.slow = slow;
        self
    }

    pub fn with_dependency(mut self, dependency: TestCaseId) -> Self {
        self.dependencies.push(dependency);
        self
    }

    pub fn with_dependencies(mut self, dependencies: Vec<TestCaseId>) -> Self {
        self.dependencies = dependencies;
        self
    }

    pub fn has_tag(&self, tag: &str) -> bool {
        self.tags.iter().any(|t| t == tag)
    }

    pub fn is_skipped(&self) -> bool {
        self.skip_reason.is_some()
    }

    pub fn is_flaky(&self) -> bool {
        self.flaky
    }

    pub fn is_slow(&self) -> bool {
        self.slow
    }

    pub fn has_dependencies(&self) -> bool {
        !self.dependencies.is_empty()
    }

    pub fn file_hash_key(&self) -> String {
        format!("{}:{}", self.file_path.display(), self.line)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_case_creation() {
        let tc = TestCase::new("test::add", "test_addition", PathBuf::from("test.rs"), 10)
            .with_description("Test addition")
            .with_tag("unit")
            .with_priority(TestPriority::High)
            .with_timeout(Duration::from_secs(5));

        assert_eq!(tc.id.as_str(), "test::add");
        assert_eq!(tc.name, "test_addition");
        assert!(tc.has_tag("unit"));
        assert_eq!(tc.priority, TestPriority::High);
    }

    #[test]
    fn test_priority_ordering() {
        assert!(TestPriority::Critical > TestPriority::High);
        assert!(TestPriority::High > TestPriority::Normal);
        assert!(TestPriority::Normal > TestPriority::Low);
    }

    #[test]
    fn test_skip_detection() {
        let tc = TestCase::new("test1", "test", PathBuf::from("test.rs"), 1)
            .with_skip_reason("Not implemented");
        assert!(tc.is_skipped());
    }

    #[test]
    fn test_flaky_detection() {
        let tc = TestCase::new("test1", "test", PathBuf::from("test.rs"), 1)
            .with_flaky(true);
        assert!(tc.is_flaky());
    }
}
