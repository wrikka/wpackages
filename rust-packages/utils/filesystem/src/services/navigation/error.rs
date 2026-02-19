use thiserror::Error;

pub type NavigationResult<T> = Result<T, NavigationError>;

#[derive(Error, Debug)]
pub enum NavigationError {
    #[error("Invalid position: {0}")]
    InvalidPosition(String),

    #[error("Symbol not found: {0}")]
    SymbolNotFound(String),

    #[error("Reference not found")]
    ReferenceNotFound,

    #[error("LSP error: {0}")]
    LspError(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}
