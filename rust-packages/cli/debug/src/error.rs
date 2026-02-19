use thiserror::Error;

pub type DebugResult<T> = Result<T, DebugError>;

#[derive(Error, Debug)]
pub enum DebugError {
    #[error("Invalid breakpoint: {0}")]
    InvalidBreakpoint(String),

    #[error("Breakpoint not found")]
    BreakpointNotFound,

    #[error("Invalid position: {0}")]
    InvalidPosition(String),

    #[error("Debugger not connected")]
    NotConnected,

    #[error("Debugger already connected")]
    AlreadyConnected,

    #[error("Launch failed: {0}")]
    LaunchFailed(String),

    #[error("Attach failed: {0}")]
    AttachFailed(String),

    #[error("Process not found")]
    ProcessNotFound,

    #[error("Variable not found: {0}")]
    VariableNotFound(String),

    #[error("Stack frame not found")]
    StackFrameNotFound,

    #[error("LSP error: {0}")]
    LspError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}
