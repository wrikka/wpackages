//! Testing Framework
//!
//! A comprehensive testing framework with parallelization, caching, mocking,
//! snapshot testing, and CI/CD integrations.

pub mod error;
pub mod types;
pub mod components;

pub use error::{TestingError, TestingResult};
pub use types::{
    BackoffStrategy, CacheConfig, CoverageHeatmap, CoverageReport, Fixture, FixtureFile,
    HashAlgorithm, JUnitResult, JUnitTestCase, JUnitTestSuite, LineCoverage, MemoryMetrics,
    Mock, MockCall, MockExpectation, MockType, MockValue, MockVerification, ReportDiff,
    ReportFormat, ReportMetadata, Snapshot, SnapshotComparison, SnapshotDiff, SnapshotStore,
    SnapshotUpdateMode, BenchmarkResult, BenchmarkComparison, BenchmarkPercentiles,
    TestConfig, TestCase, TestCaseId, TestCoverage, TestExecutionResult, TestFramework,
    TestHistory, TestPriority, TestReport, TestResult, TestRunRecord, TestRunResult,
    TestSuite, TestSuiteCollection, TestSuiteResult, TestStats, ThroughputMetrics,
    FilterCondition, FilterExpression, FilterOperator, FilterDsl,
    ExpectedTimes, HistoryStore,
};

pub use components::{
    ParallelExecutor, ParallelProgress, SchedulingStrategy, WorkStealingPool,
    TestCache, CacheEntry, CacheKey, CacheStats,
    DependencyGraph, DependencyEdge, DependencyType, DependencyResolver,
    RetryPolicy, RetryCondition, RetryExecutor, RetryStats,
    TestWatcher, FileChangeEvent, FileChangeEventType, WatchConfig,
    FixtureManager, FixtureBuilder,
    SnapshotTester, SnapshotBuilder,
    MockController, MockBuilder, MockFnBuilder,
    CoverageCollector, CoverageThreshold, CoverageCheckResult,
    FlakyTestDetector, FlakyThreshold, FlakyTestInfo, FlakyReport,
    BenchmarkRunner, BenchmarkGroup,
    ReportGenerator,
    TestFilter,
    TestSandbox, SandboxConfig, SandboxHandle, SandboxResult,
    DatabaseFixture, DatabaseType, DatabaseConfig,
    HttpMockServer, MockRoute, MockResponse, MockResponseBuilder, HttpMethod,
    MutationTester, MutationConfig, MutationOperator, Mutation, MutationResult, MutationScore,
    DiffAnalyzer, TestDiff, ResultChange,
    CiIntegration, CiContext, CiProvider,
    TestDiscovery,
    TestRunner, TestRunnerImpl, create_test_runner,
    TestClient, TestClientImpl, create_test_client,
};

pub mod prelude {
    pub use crate::error::{TestingError, TestingResult};
    pub use crate::types::{
        TestCase, TestConfig, TestExecutionResult, TestResult, TestSuite,
    };
    pub use crate::components::{
        ParallelExecutor, TestCache, TestWatcher, SnapshotTester, MockController,
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_prelude_exports() {
        let _config = TestConfig::new();
    }
}
