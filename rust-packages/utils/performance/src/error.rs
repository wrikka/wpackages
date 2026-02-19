use thiserror::Error;

pub type PerformanceResult<T> = Result<T, PerformanceError>;

#[derive(Error, Debug)]
pub enum PerformanceError {
    #[error("Invalid metric: {0}")]
    InvalidMetric(String),

    #[error("Metric not found: {0}")]
    MetricNotFound(String),

    #[error("Report not found: {0}")]
    ReportNotFound(String),

    #[error("Invalid optimization: {0}")]
    InvalidOptimization(String),

    #[error("Optimization failed: {0}")]
    OptimizationFailed(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),

    #[error("Lock error: {0}")]
    LockError(String),

    #[error("Profiling already in progress")]
    ProfilingAlreadyInProgress,

    #[error("No profiling in progress")]
    NoProfilingInProgress,

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}
