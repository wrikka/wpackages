use thiserror::Error;

/// Error types for the wdocs-search library
#[derive(Error, Debug)]
pub enum SearchError {
    #[error("Index is not built yet")]
    IndexNotBuilt,

    #[error("No documents found for query: {0}")]
    NoDocumentsFound(String),

    #[error("Document with ID {0} not found")]
    DocumentNotFound(u64),

    #[error("Invalid search options: {0}")]
    InvalidSearchOptions(String),

    #[error("Fuzzy search failed: {0}")]
    FuzzySearchError(String),

    #[error("Suggestion generation failed: {0}")]
    SuggestionError(String),

    #[error("Persistence error: {0}")]
    PersistenceError(#[from] anyhow::Error),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Invalid document: {0}")]
    InvalidDocument(String),

    #[error("Index is empty")]
    IndexEmpty,

    #[error("Invalid query: {0}")]
    InvalidQuery(String),

    #[error("Search timeout: {0}ms")]
    SearchTimeout(u64),

    #[error("Memory limit exceeded: {0} bytes")]
    MemoryLimitExceeded(usize),
}

/// Result type for search operations
pub type SearchResult<T> = Result<T, SearchError>;

/// Configuration errors
#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("Missing required configuration: {0}")]
    MissingConfig(String),

    #[error("Configuration file not found: {0}")]
    ConfigNotFound(String),

    #[error("Failed to parse configuration: {0}")]
    ParseError(#[from] serde_json::Error),
}

/// Result type for configuration operations
pub type ConfigResult<T> = Result<T, ConfigError>;
