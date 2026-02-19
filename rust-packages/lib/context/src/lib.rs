//! # Context Suite
//!
//! Project context analysis suite for wterminal IDE
//!
//! This library provides tools for analyzing project context, including:
//! - Dependency parsing
//! - Framework detection
//! - Language detection
//! - AST parsing
//! - Code metrics
//! - Cross-referencing
//! - Incremental parsing
//! - Project information

// Core modules
pub mod config;
pub mod error;
pub mod telemetry;

// Domain modules
pub mod advanced_search;
pub mod analyzer;
pub mod ast_parser;
pub mod code_metrics;
pub mod constants;
pub mod cross_reference;
pub mod dependency;
pub mod detector;
pub mod incremental_parser;
pub mod package_manager;
pub mod project_info;
pub mod types;

// Infrastructure modules
pub mod adapters;
pub mod components;
pub mod services;
pub mod utils;

// Re-export commonly used types and functions
pub use config::*;
pub use error::*;
pub use telemetry::*;

// Prelude module for convenient imports
pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! Import this module to get all essential types and traits:
    //!
    //! ```rust,no_run
    //! use context::prelude::*;
    //! ```

    // Re-export core types
    pub use crate::config::{Config, AnalysisConfig, WatcherConfig, LoggingConfig};
    pub use crate::error::{ContextError, ContextResult};
    pub use crate::telemetry::{init_subscriber, init_subscriber_with_prefix};

    // Re-export domain types
    pub use crate::analyzer::*;
    pub use crate::dependency::*;
    pub use crate::detector::*;
    pub use crate::package_manager::*;
    pub use crate::project_info::*;
    pub use crate::types::*;
}
