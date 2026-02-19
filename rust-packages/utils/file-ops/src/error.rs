//! Error types for `file-ops` operations.
//!
//! This module defines all error types used throughout the crate,
//! following strict error handling patterns with `thiserror` for libraries
//! and `anyhow` for applications.

use camino::Utf8PathBuf;
use thiserror::Error;

/// Specialized [`Result`] type for `file-ops` operations.
///
/// Use this type alias for all fallible operations in this crate
/// to ensure consistent error handling.
pub type Result<T> = std::result::Result<T, Error>;

/// The main error type for `file-ops` operations.
///
/// All errors in this crate are unified into this enum using `thiserror`,
/// providing structured error information and automatic source chain preservation.
#[derive(Debug, Error)]
#[non_exhaustive]
pub enum Error {
    /// An I/O error occurred.
    #[error("I/O error for path: {path}")]
    Io {
        path: Utf8PathBuf,
        #[source]
        source: std::io::Error,
    },

    /// A glob pattern was invalid.
    #[error(transparent)]
    Glob(#[from] glob::PatternError),

    /// Failed to persist a temporary file.
    #[error("Failed to persist temporary file: {0}")]
    Persist(#[from] tempfile::PersistError),

    /// A file watcher error occurred.
    #[error("File watcher error: {0}")]
    Notify(#[from] notify::Error),

    /// A URL could not be parsed.
    #[error("URL parsing error: {0}")]
    UrlParse(#[from] url::ParseError),

    /// An error occurred in the object store.
    #[error("Object store error: {0}")]
    ObjectStore(#[from] object_store::Error),

    /// A JSON serialization or deserialization error occurred.
    #[error("JSON serialization/deserialization error: {0}")]
    Json(#[from] serde_json::Error),

    /// A TOML deserialization error occurred.
    #[error("TOML parse error: {0}")]
    TomlDeserialize(#[from] toml::de::Error),

    /// A TOML serialization error occurred.
    #[error("TOML serialization error: {0}")]
    TomlSerialize(#[from] toml::ser::Error),

    /// A file patching error occurred.
    #[error("Patch error: {0}")]
    Patch(String),

    /// An encryption operation failed.
    #[error("Encryption failed: {0}")]
    Encryption(String),

    /// A decryption operation failed.
    #[error("Decryption failed: {0}")]
    Decryption(String),

    /// The given path is not a directory.
    #[error("Not a directory: {0}")]
    NotADirectory(Utf8PathBuf),

    /// The given path is invalid or malformed.
    #[error("Invalid path: {0:?}")]
    InvalidPath(std::path::PathBuf),

    /// A path was not valid UTF-8.
    #[error("Invalid UTF-8 in path: {path:?}")]
    InvalidUtf8 {
        /// The path that contained invalid UTF-8.
        path: std::path::PathBuf,
    },

    /// The operation was denied due to insufficient permissions.
    #[error("Permission denied: {path}")]
    PermissionDenied {
        /// The path where permission was denied.
        path: Utf8PathBuf,
    },

    /// The specified file or directory was not found.
    #[error("File not found: {path}")]
    NotFound {
        /// The path that was not found.
        path: Utf8PathBuf,
    },

    /// The destination file already exists.
    #[error("File already exists: {path}")]
    AlreadyExists {
        /// The path that already exists.
        path: Utf8PathBuf,
    },

    /// An atomic operation failed.
    #[error("Atomic operation failed: {path}")]
    AtomicOperationFailed {
        /// The path where the atomic operation failed.
        path: Utf8PathBuf,
        /// The underlying error that caused the failure.
        #[source]
        source: Box<dyn std::error::Error + Send + Sync + 'static>,
    },

    /// A checksum mismatch was detected.
    #[error("Checksum mismatch for {path}")]
    ChecksumMismatch {
        /// The path where the checksum mismatch occurred.
        path: Utf8PathBuf,
        /// The expected checksum value.
        expected: String,
        /// The actual checksum value.
        actual: String,
    },

    /// A validation error occurred.
    #[error("Validation error: {0}")]
    Validation(String),

    /// An operation timed out.
    #[error("Operation timed out after {duration:?}")]
    Timeout {
        /// The duration after which the operation timed out.
        duration: std::time::Duration,
    },

    /// A batch operation partially failed.
    #[error("Batch operation failed for {failed_count} of {total_count} items")]
    BatchPartialFailure {
        /// Number of items that failed.
        failed_count: usize,
        /// Total number of items in the batch.
        total_count: usize,
        /// Individual errors for failed items.
        errors: Vec<Error>,
    },
}

impl Error {
    /// Create an I/O error with the given path and source.
    #[must_use]
    pub fn io(path: impl Into<Utf8PathBuf>, source: std::io::Error) -> Self {
        Self::Io {
            path: path.into(),
            source,
        }
    }

    /// Create a not found error for the given path.
    #[must_use]
    pub fn not_found(path: impl Into<Utf8PathBuf>) -> Self {
        Self::NotFound { path: path.into() }
    }

    /// Create an already exists error for the given path.
    #[must_use]
    pub fn already_exists(path: impl Into<Utf8PathBuf>) -> Self {
        Self::AlreadyExists { path: path.into() }
    }

    /// Create a permission denied error for the given path.
    #[must_use]
    pub fn permission_denied(path: impl Into<Utf8PathBuf>) -> Self {
        Self::PermissionDenied { path: path.into() }
    }

    /// Create a validation error with the given message.
    #[must_use]
    pub fn validation(msg: impl Into<String>) -> Self {
        Self::Validation(msg.into())
    }

    /// Create a timeout error with the given duration.
    #[must_use]
    pub fn timeout(duration: std::time::Duration) -> Self {
        Self::Timeout { duration }
    }
}

/// Allow converting std::io::Error to Error with a default empty path.
/// 
/// Note: This is primarily for contexts where the path is not available.
/// When the path is known, use `Error::io(path, source)` instead.
impl From<std::io::Error> for Error {
    fn from(source: std::io::Error) -> Self {
        Self::Io {
            path: Utf8PathBuf::from(""),
            source,
        }
    }
}
