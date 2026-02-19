use thiserror::Error;

pub type SchemaResult<T> = Result<T, SchemaError>;

#[derive(Debug, Error)]
pub enum SchemaError {
    #[error("Validation failed: {message}")]
    ValidationError {
        message: String,
        path: Option<String>,
    },

    #[error("Type mismatch: expected {expected}, found {found}")]
    TypeMismatch {
        expected: String,
        found: String,
        path: Option<String>,
    },

    #[error("Required field missing: {field}")]
    RequiredFieldMissing { field: String, path: Option<String> },

    #[error("Invalid value for field '{field}': {reason}")]
    InvalidValue {
        field: String,
        reason: String,
        path: Option<String>,
    },

    #[error("Schema not found: {name}")]
    SchemaNotFound { name: String },

    #[error("Schema compilation error: {message}")]
    CompilationError { message: String },

    #[error("Circular reference detected: {path}")]
    CircularReference { path: String },

    #[error("Index out of bounds: index {index}, length {length}")]
    IndexOutOfBounds {
        index: usize,
        length: usize,
        path: Option<String>,
    },

    #[error("Key not found: {key}")]
    KeyNotFound { key: String, path: Option<String> },

    #[error("Invalid schema definition: {message}")]
    InvalidSchema { message: String },

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Deserialization error: {0}")]
    DeserializationError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Custom validation failed: {message}")]
    CustomValidation {
        message: String,
        path: Option<String>,
    },
}

impl SchemaError {
    pub fn with_path(mut self, path: impl Into<String>) -> Self {
        let path_str = path.into();
        match self {
            Self::ValidationError { path: _, message } => {
                self = Self::ValidationError {
                    message,
                    path: Some(path_str),
                }
            }
            Self::TypeMismatch {
                path: _,
                expected,
                found,
            } => {
                self = Self::TypeMismatch {
                    expected,
                    found,
                    path: Some(path_str),
                }
            }
            Self::RequiredFieldMissing { path: _, field } => {
                self = Self::RequiredFieldMissing {
                    field,
                    path: Some(path_str),
                }
            }
            Self::InvalidValue {
                path: _,
                field,
                reason,
            } => {
                self = Self::InvalidValue {
                    field,
                    reason,
                    path: Some(path_str),
                }
            }
            Self::IndexOutOfBounds {
                path: _,
                index,
                length,
            } => {
                self = Self::IndexOutOfBounds {
                    index,
                    length,
                    path: Some(path_str),
                }
            }
            Self::KeyNotFound { path: _, key } => {
                self = Self::KeyNotFound {
                    key,
                    path: Some(path_str),
                }
            }
            Self::CustomValidation { path: _, message } => {
                self = Self::CustomValidation {
                    message,
                    path: Some(path_str),
                }
            }
            _ => {}
        }
        self
    }
}
