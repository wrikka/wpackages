//! Symbol module.
//!
//! This module provides symbol functionality including types, filtering,
//! sorting, and search operations.

pub mod filter;
pub mod search;
pub mod sort;
pub mod tests;
pub mod types;

// Re-export main types for convenience
pub use filter::SymbolFilter;
pub use search::{SymbolScope, SymbolSearchResult};
pub use sort::SymbolSortBy;
pub use types::{Symbol, SymbolLocation};
