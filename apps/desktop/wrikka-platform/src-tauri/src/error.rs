use thiserror::Error;

#[derive(Error, Debug)]
pub enum DesktopError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("Terminal error: {0}")]
    Terminal(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("Application error: {0}")]
    Application(String),
}

pub type Result<T> = std::result::Result<T, DesktopError>;
