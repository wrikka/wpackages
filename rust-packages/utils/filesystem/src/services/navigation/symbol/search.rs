//! Symbol search functionality.
//!
//! This module contains symbol search result and scope definitions.

use super::types::Symbol;
use serde::{Deserialize, Serialize};

/// Symbol search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolSearchResult {
    pub symbols: Vec<Symbol>,
    pub total_count: usize,
    pub is_incomplete: bool,
}

impl SymbolSearchResult {
    /// Create a new symbol search result.
    pub fn new(symbols: Vec<Symbol>, is_incomplete: bool) -> Self {
        let total_count = symbols.len();
        Self {
            symbols,
            total_count,
            is_incomplete,
        }
    }
}

/// Symbol scope
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SymbolScope {
    Workspace,
    Document,
}
