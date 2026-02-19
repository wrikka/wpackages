use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Configuration error: {0}")]
    Config(#[from] Box<figment::Error>),

    #[error("File not found: {path}")]
    FileNotFound { path: String },

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Terminal error: {0}")]
    Terminal(String),

    #[error("Render error: {0}")]
    Render(String),

    #[error("Key binding error: {0}")]
    KeyBinding(String),

    #[error("Tree-sitter error: {0}")]
    TreeSitter(String),

    #[error("LSP error: {0}")]
    Lsp(String),

    #[error("Unsupported language: {0}")]
    UnsupportedLanguage(String),

    #[error("Plugin error: {0}")]
    Plugin(String),

    #[error("Text object error: {0}")]
    TextObject(String),

    #[error("Surround error: {0}")]
    Surround(String),

    #[error("Anyhow error: {0}")]
    Anyhow(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, AppError>;
