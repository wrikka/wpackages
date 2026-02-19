use thiserror::Error;

pub type TestingResult<T> = Result<T, TestingError>;

#[derive(Error, Debug)]
pub enum TestingError {
    #[error("Test execution failed: {0}")]
    ExecutionFailed(String),

    #[error("Test not found: {0}")]
    TestNotFound(String),

    #[error("Test timeout after {0:?}")]
    Timeout(std::time::Duration),

    #[error("Test cancelled")]
    Cancelled,

    #[error("Invalid test configuration: {0}")]
    InvalidConfiguration(String),

    #[error("Discovery error: {0}")]
    DiscoveryError(String),

    #[error("Cache error: {0}")]
    CacheError(String),

    #[error("Dependency cycle detected: {0}")]
    DependencyCycle(String),

    #[error("Fixture error: {0}")]
    FixtureError(String),

    #[error("Snapshot mismatch for '{name}':\nExpected:\n{expected}\nActual:\n{actual}")]
    SnapshotMismatch {
        name: String,
        expected: String,
        actual: String,
    },

    #[error("Mock error: {0}")]
    MockError(String),

    #[error("Coverage error: {0}")]
    CoverageError(String),

    #[error("Report generation error: {0}")]
    ReportError(String),

    #[error("Filter DSL parse error: {0}")]
    FilterParseError(String),

    #[error("Sandbox error: {0}")]
    SandboxError(String),

    #[error("Database fixture error: {0}")]
    DatabaseError(String),

    #[error("HTTP mock server error: {0}")]
    HttpMockError(String),

    #[error("Mutation testing error: {0}")]
    MutationError(String),

    #[error("History tracking error: {0}")]
    HistoryError(String),

    #[error("CI/CD integration error: {0}")]
    CiCdError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Toml error: {0}")]
    TomlError(#[from] toml::de::Error),

    #[error("Lock error: {0}")]
    LockError(String),

    #[error("Channel error: {0}")]
    ChannelError(String),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

impl TestingError {
    pub fn execution_failed(msg: impl Into<String>) -> Self {
        Self::ExecutionFailed(msg.into())
    }

    pub fn test_not_found(id: impl Into<String>) -> Self {
        Self::TestNotFound(id.into())
    }

    pub fn timeout(duration: std::time::Duration) -> Self {
        Self::Timeout(duration)
    }

    pub fn cancelled() -> Self {
        Self::Cancelled
    }

    pub fn invalid_configuration(msg: impl Into<String>) -> Self {
        Self::InvalidConfiguration(msg.into())
    }

    pub fn discovery_error(msg: impl Into<String>) -> Self {
        Self::DiscoveryError(msg.into())
    }

    pub fn runner_error(msg: impl Into<String>) -> Self {
        Self::ExecutionFailed(msg.into())
    }

    pub fn cache_error(msg: impl Into<String>) -> Self {
        Self::CacheError(msg.into())
    }

    pub fn dependency_cycle(msg: impl Into<String>) -> Self {
        Self::DependencyCycle(msg.into())
    }

    pub fn fixture_error(msg: impl Into<String>) -> Self {
        Self::FixtureError(msg.into())
    }

    pub fn snapshot_mismatch(name: impl Into<String>, expected: impl Into<String>, actual: impl Into<String>) -> Self {
        Self::SnapshotMismatch {
            name: name.into(),
            expected: expected.into(),
            actual: actual.into(),
        }
    }

    pub fn mock_error(msg: impl Into<String>) -> Self {
        Self::MockError(msg.into())
    }

    pub fn coverage_error(msg: impl Into<String>) -> Self {
        Self::CoverageError(msg.into())
    }

    pub fn report_error(msg: impl Into<String>) -> Self {
        Self::ReportError(msg.into())
    }

    pub fn filter_parse_error(msg: impl Into<String>) -> Self {
        Self::FilterParseError(msg.into())
    }

    pub fn sandbox_error(msg: impl Into<String>) -> Self {
        Self::SandboxError(msg.into())
    }

    pub fn database_error(msg: impl Into<String>) -> Self {
        Self::DatabaseError(msg.into())
    }

    pub fn http_mock_error(msg: impl Into<String>) -> Self {
        Self::HttpMockError(msg.into())
    }

    pub fn mutation_error(msg: impl Into<String>) -> Self {
        Self::MutationError(msg.into())
    }

    pub fn history_error(msg: impl Into<String>) -> Self {
        Self::HistoryError(msg.into())
    }

    pub fn ci_cd_error(msg: impl Into<String>) -> Self {
        Self::CiCdError(msg.into())
    }

    pub fn parse_error(msg: impl Into<String>) -> Self {
        Self::ParseError(msg.into())
    }

    pub fn lock_error(msg: impl Into<String>) -> Self {
        Self::LockError(msg.into())
    }

    pub fn channel_error(msg: impl Into<String>) -> Self {
        Self::ChannelError(msg.into())
    }

    pub fn is_retryable(&self) -> bool {
        matches!(
            self,
            Self::Timeout(_) | Self::ExecutionFailed(_) | Self::ChannelError(_)
        )
    }

    pub fn is_critical(&self) -> bool {
        matches!(
            self,
            Self::DependencyCycle(_) | Self::InvalidConfiguration(_) | Self::Cancelled
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation() {
        let err = TestingError::execution_failed("test failed");
        assert!(err.to_string().contains("test failed"));
    }

    #[test]
    fn test_error_retryable() {
        let err = TestingError::timeout(std::time::Duration::from_secs(10));
        assert!(err.is_retryable());

        let err = TestingError::dependency_cycle("cycle");
        assert!(!err.is_retryable());
    }

    #[test]
    fn test_error_critical() {
        let err = TestingError::dependency_cycle("cycle detected");
        assert!(err.is_critical());

        let err = TestingError::execution_failed("failed");
        assert!(!err.is_critical());
    }
}
