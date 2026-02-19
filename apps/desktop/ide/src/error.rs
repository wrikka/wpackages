use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error("Git error: {0}")]
    Git(#[from] git::error::GitError),
    #[error("Filesystem error: {0}")]
    Fs(#[from] filesystem::error::FsError),
    #[error("Terminal error: {0}")]
    Terminal(#[from] terminal::error::TerminalError),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Generic error: {0}")]
    Generic(String),
    
    #[error("Hierarchy error: {0}")]
    Hierarchy(#[from] HierarchyError),
    
    #[error("CI/CD error: {0}")]
    CiCd(#[from] ci_cd::CiCdError),
}


pub type AppResult<T> = Result<T, AppError>;

#[derive(Error, Debug)]
pub enum HierarchyError {
    #[error("Invalid hierarchy: {0}")]
    InvalidHierarchy(String),

    #[error("Invalid position: {0}")]
    InvalidPosition(String),

    #[error("LSP error: {0}")]
    LspError(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

pub type HierarchyResult<T> = Result<T, HierarchyError>;
