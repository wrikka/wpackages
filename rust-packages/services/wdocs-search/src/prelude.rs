//! Prelude module for common imports

// Re-export commonly used types
pub use crate::app::{FuzzySearcher, Index, PersistenceManager, SearchEngine, SuggestionEngine};
pub use crate::components::{inverted_index::InvertedIndex, tokenizer::Tokenizer};
pub use crate::config::SearchConfig;
pub use crate::error::{ConfigError, ConfigResult, SearchError, SearchResult as ErrorResult};
pub use crate::types::{
    document::{DocId, Document},
    search_options::{IndexStats, SearchOptions, SearchResult},
};

// Re-export common dependencies
pub use anyhow::Result;
pub use rustc_hash::FxHashMap;
pub use serde::{Deserialize, Serialize};
pub use serde_json::json;
pub use std::collections::HashMap;
pub use std::path::Path;
pub use std::path::PathBuf;

// Re-export tracing macros
pub use tracing::{debug, error, info, trace, warn};

// Re-export common traits
pub use std::clone::Clone;
pub use std::default::Default;
pub use std::fmt::Debug;
