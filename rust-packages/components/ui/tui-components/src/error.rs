use thiserror::Error;

/// Error types for tui-components package
#[derive(Error, Debug)]
pub enum TuiComponentsError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Theme error: {0}")]
    Theme(String),

    #[error("Command palette error: {0}")]
    CommandPalette(String),

    #[error("File explorer error: {0}")]
    FileExplorer(String),

    #[error("Chat panel error: {0}")]
    ChatPanel(String),

    #[error("Plan panel error: {0}")]
    PlanPanel(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("{0}")]
    Custom(String),
}

/// Result type alias for TuiComponentsError
pub type Result<T> = std::result::Result<T, TuiComponentsError>;
