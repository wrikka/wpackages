use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("I/O Error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON Error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Request Error: {0}")]
    Reqwest(#[from] reqwest::Error),
    #[error("Regex Error: {0}")]
    Regex(#[from] regex::Error),
    #[error("Task failed: {0}")]
    Task(String),
    #[error("Cache Error: {0}")]
    Cache(String),
    #[error("Glob Error: {0}")]
    Glob(#[from] glob::GlobError),
    #[error("Pattern Error: {0}")]
    Pattern(#[from] glob::PatternError),
    #[error("Strip Prefix Error: {0}")]
    StripPrefix(#[from] std::path::StripPrefixError),
    #[error("Ignore Override Error: {0}")]
    Ignore(#[from] ignore::Error),
    #[error("Tokio Join Error: {0}")]
    TokioJoin(#[from] tokio::task::JoinError),
    #[error("Circular dependency detected in package: {0}")]
    CircularDependency(String),
    #[error("Unknown error: {0}")]
    Unknown(String),
    #[error("Doctor check failed: {0}")]
    Doctor(String),
}

pub type AppResult<T> = Result<T, AppError>;
