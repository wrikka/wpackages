use thiserror::Error;

pub type SearchResult<T> = Result<T, SearchError>;

#[derive(Error, Debug)]
pub enum SearchError {
    #[error("Invalid search pattern: {0}")]
    InvalidPattern(String),

    #[error("Invalid regex: {0}")]
    InvalidRegex(String),

    #[error("No matches found")]
    NoMatchesFound,

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),

    #[error("Glob error: {0}")]
    GlobError(String),

    #[error("Path error: {0}")]
    PathError(String),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}
