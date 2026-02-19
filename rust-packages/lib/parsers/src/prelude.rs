//! Common imports and utilities for the parsers library
//!
//! This module provides commonly used types and functions to avoid
//! repetitive imports across the library.

// Re-export core types
pub use crate::{
    error::{ParseError, Result, Format},
    config::Config,
    detection::detect_format,
    streaming::{StreamingParser, parse_large_file_async},
    validation::{SchemaValidator, validate_json_with_schema},
    performance::{Cache, OptimizedParser, parse_json_zero_copy},
    serialization::{SerializationOptions, Serializer, serialize_to_format},
    plugins::{ParserPlugin, PluginRegistry, CsvPlugin, IniPlugin},
};

// Standard library re-exports
pub use std::{
    collections::HashMap,
    fmt::{self, Debug, Display},
    fs::File,
    io::{self, Read, Write},
    path::{Path, PathBuf},
    result::Result as StdResult,
    string::String,
    vec::Vec,
};

// External library re-exports
pub use serde::{Deserialize, Serialize};
pub use serde_json::{self, Value, Map};
pub use tokio::{self, fs, io};
pub use tracing::{self, debug, error, info, warn, trace, instrument};

// Commonly used traits
pub use futures::{Future, Stream, StreamExt};
pub use async_trait::async_trait;

// Constants
pub const DEFAULT_MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10MB
pub const DEFAULT_MAX_DEPTH: usize = 100;
pub const DEFAULT_CACHE_TTL: u64 = 300; // 5 minutes

/// Result type for async operations
pub type AsyncResult<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

/// Common validation trait
pub trait Validate {
    fn validate(&self) -> Result<()>;
}

/// Common parser trait
pub trait Parse: Sized {
    type Output;
    fn parse(&self, input: &str) -> Result<Self::Output>;
}

/// Common serializer trait
pub trait Serialize: Sized {
    fn serialize(&self, data: &Value, options: &SerializationOptions) -> Result<String>;
}

/// Utility functions
pub mod utils {
    use super::*;

    /// Check if string is empty or whitespace only
    pub fn is_empty_or_whitespace(s: &str) -> bool {
        s.trim().is_empty()
    }

    /// Truncate string to specified length with ellipsis
    pub fn truncate_with_ellipsis(s: &str, max_len: usize) -> String {
        if s.len() <= max_len {
            s.to_string()
        } else {
            format!("{}...", &s[..max_len.saturating_sub(3)])
        }
    }

    /// Generate a unique identifier
    pub fn generate_id() -> String {
        uuid::Uuid::new_v4().to_string()
    }

    /// Get current timestamp as string
    pub fn timestamp() -> String {
        chrono::Utc::now().to_rfc3339()
    }

    /// Format file size in human readable format
    pub fn format_file_size(bytes: usize) -> String {
        const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
        let mut size = bytes as f64;
        let mut unit_index = 0;

        while size >= 1024.0 && unit_index < UNITS.len() - 1 {
            size /= 1024.0;
            unit_index += 1;
        }

        format!("{:.2} {}", size, UNITS[unit_index])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_utils_is_empty_or_whitespace() {
        assert!(utils::is_empty_or_whitespace(""));
        assert!(utils::is_empty_or_whitespace("   "));
        assert!(!utils::is_empty_or_whitespace("test"));
    }

    #[test]
    fn test_utils_truncate_with_ellipsis() {
        assert_eq!(utils::truncate_with_ellipsis("hello world", 8), "hello...");
        assert_eq!(utils::truncate_with_ellipsis("short", 10), "short");
    }

    #[test]
    fn test_utils_generate_id() {
        let id1 = utils::generate_id();
        let id2 = utils::generate_id();
        assert_ne!(id1, id2);
        assert_eq!(id1.len(), 36); // UUID v4 length
    }

    #[test]
    fn test_utils_format_file_size() {
        assert_eq!(utils::format_file_size(1024), "1.00 KB");
        assert_eq!(utils::format_file_size(1048576), "1.00 MB");
        assert_eq!(utils::format_file_size(1073741824), "1.00 GB");
    }
}
