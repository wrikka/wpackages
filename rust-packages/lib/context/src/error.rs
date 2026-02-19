use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContextError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Notify error: {0}")]
    Notify(#[from] notify::Error),

    #[error("System time error: {0}")]
    SystemTimeError(#[from] std::time::SystemTimeError),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Project not found: {0}")]
    NotFound(String),

    #[error("Analysis error: {0}")]
    AnalysisError(String),

    #[error("Watcher error: {0}")]
    WatcherError(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Tree-sitter error: {0}")]
    TreeSitterError(String),
}

pub type ContextResult<T> = Result<T, ContextError>;
