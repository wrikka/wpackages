//! Type definitions for Context Suite
//!
//! This module contains all data structures, enums, and traits used throughout the context suite.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Represents a programming language
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Language {
    Rust,
    JavaScript,
    TypeScript,
    Python,
    Go,
    Java,
    Cpp,
    C,
    Other(String),
}

impl Language {
    /// Get the file extensions associated with this language
    pub fn extensions(&self) -> Vec<&'static str> {
        match self {
            Language::Rust => vec!["rs"],
            Language::JavaScript => vec!["js", "jsx", "mjs"],
            Language::TypeScript => vec!["ts", "tsx"],
            Language::Python => vec!["py", "pyi", "pyw"],
            Language::Go => vec!["go"],
            Language::Java => vec!["java"],
            Language::Cpp => vec!["cpp", "cxx", "cc", "h", "hpp"],
            Language::C => vec!["c", "h"],
            Language::Other(_) => vec![],
        }
    }

    /// Get the display name of the language
    pub fn display_name(&self) -> &str {
        match self {
            Language::Rust => "Rust",
            Language::JavaScript => "JavaScript",
            Language::TypeScript => "TypeScript",
            Language::Python => "Python",
            Language::Go => "Go",
            Language::Java => "Java",
            Language::Cpp => "C++",
            Language::C => "C",
            Language::Other(name) => name,
        }
    }
}

/// Represents a framework or library
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Framework {
    /// Name of the framework
    pub name: String,
    /// Version if detected
    pub version: Option<String>,
    /// Language this framework is for
    pub language: Language,
}

/// Represents a project dependency
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    /// Name of the dependency
    pub name: String,
    /// Version requirement
    pub version: Option<String>,
    /// Whether it's a development dependency
    pub is_dev: bool,
    /// Source of the dependency (npm, cargo, pip, etc.)
    pub source: String,
}

/// Represents a file in the project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    /// Path to the file
    pub path: PathBuf,
    /// File size in bytes
    pub size: u64,
    /// Last modified timestamp
    pub modified: DateTime<Utc>,
    /// Detected language
    pub language: Option<Language>,
    /// Whether the file is binary
    pub is_binary: bool,
}

/// Represents a project summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectInfo {
    /// Project name
    pub name: String,
    /// Project root directory
    pub root_path: PathBuf,
    /// Detected languages and their usage
    pub languages: HashMap<Language, usize>,
    /// Detected frameworks
    pub frameworks: Vec<Framework>,
    /// Dependencies
    pub dependencies: Vec<Dependency>,
    /// Total number of files
    pub file_count: usize,
    /// Total lines of code
    pub lines_of_code: usize,
    /// Project creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last analyzed timestamp
    pub analyzed_at: DateTime<Utc>,
}

/// Represents code metrics for a file or project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeMetrics {
    /// Lines of code
    pub loc: usize,
    /// Lines of comments
    pub comments: usize,
    /// Blank lines
    pub blank: usize,
    /// Cyclomatic complexity
    pub complexity: usize,
    /// Number of functions
    pub functions: usize,
    /// Number of classes/structs
    pub classes: usize,
}

/// Represents a cross-reference between symbols
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossReference {
    /// Source symbol
    pub from: String,
    /// Target symbol
    pub to: String,
    /// Type of reference (call, import, definition, etc.)
    pub reference_type: ReferenceType,
    /// File where the reference occurs
    pub file_path: PathBuf,
    /// Line number
    pub line: usize,
}

/// Type of cross-reference
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReferenceType {
    Call,
    Import,
    Definition,
    Declaration,
    Assignment,
    TypeReference,
}

/// Represents a search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    /// File path
    pub file_path: PathBuf,
    /// Line number
    pub line: usize,
    /// Column number
    pub column: usize,
    /// Matching text
    pub text: String,
    /// Context around the match
    pub context: String,
    /// Relevance score
    pub score: f64,
}

/// Represents a parsing error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseError {
    /// File path
    pub file_path: PathBuf,
    /// Line number
    pub line: usize,
    /// Column number
    pub column: usize,
    /// Error message
    pub message: String,
    /// Error severity
    pub severity: ErrorSeverity,
}

/// Error severity levels
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorSeverity {
    Error,
    Warning,
    Info,
}

/// Represents a watcher event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatcherEvent {
    /// Event type
    pub event_type: WatcherEventType,
    /// File path
    pub path: PathBuf,
    /// Timestamp
    pub timestamp: DateTime<Utc>,
}

/// Types of file system events
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum WatcherEventType {
    Created,
    Modified,
    Deleted,
    Moved,
}
