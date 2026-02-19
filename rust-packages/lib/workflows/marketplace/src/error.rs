//! Error types for marketplace

use thiserror::Error;

/// Result type alias for marketplace operations
pub type Result<T> = std::result::Result<T, MarketplaceError>;

/// Errors that can occur in marketplace operations
#[derive(Debug, Error)]
pub enum MarketplaceError {
    #[error("Template not found: {0}")]
    TemplateNotFound(String),

    #[error("Template already exists: {0}")]
    TemplateExists(String),

    #[error("Invalid template data: {0}")]
    InvalidTemplate(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Author not found: {0}")]
    AuthorNotFound(String),

    #[error("Review not found: {0}")]
    ReviewNotFound(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}
