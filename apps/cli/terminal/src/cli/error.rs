use thiserror::Error;

#[derive(Error, Debug)]
pub enum ExtError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Extension not found: {name}")]
    ExtensionNotFound { name: String },

    #[error("Extension already exists: {name}")]
    ExtensionAlreadyExists { name: String },

    #[error("Build failed: {reason}")]
    BuildFailed { reason: String },

    #[error("Test failed: {reason}")]
    TestFailed { reason: String },

    #[error("Publish failed: {reason}")]
    PublishFailed { reason: String },

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Git error: {0}")]
    Git(#[from] git2::Error),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Toml error: {0}")]
    Toml(#[from] toml::de::Error),
}
