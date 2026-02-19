//! Symbol filtering functionality.
//!
//! This module contains symbol filtering and matching logic.

use lsp_types::SymbolKind;

use super::types::Symbol;
use super::search::SymbolScope;

/// Symbol filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolFilter {
    pub query: String,
    pub scope: SymbolScope,
    pub kinds: Vec<SymbolKind>,
    pub exclude_deprecated: bool,
}

impl SymbolFilter {
    /// Create a new symbol filter.
    pub fn new(query: impl Into<String>) -> Self {
        Self {
            query: query.into(),
            scope: SymbolScope::Workspace,
            kinds: Vec::new(),
            exclude_deprecated: true,
        }
    }

    /// Set search scope.
    pub fn with_scope(mut self, scope: SymbolScope) -> Self {
        self.scope = scope;
        self
    }

    /// Set symbol kinds to include.
    pub fn with_kinds(mut self, kinds: Vec<SymbolKind>) -> Self {
        self.kinds = kinds;
        self
    }

    /// Set whether to include deprecated symbols.
    pub fn with_deprecated(mut self, include_deprecated: bool) -> Self {
        self.exclude_deprecated = !include_deprecated;
        self
    }

    /// Check if symbol matches filter criteria.
    pub fn matches(&self, symbol: &Symbol) -> bool {
        // Check query
        if !self.query.is_empty() {
            let query_lower = self.query.to_lowercase();
            let name_lower = symbol.name.to_lowercase();
            if !name_lower.contains(&query_lower) {
                return false;
            }
        }

        // Check kinds
        if !self.kinds.is_empty() && !self.kinds.contains(&symbol.kind) {
            return false;
        }

        // Check deprecated
        if self.exclude_deprecated && symbol.deprecated {
            return false;
        }

        true
    }
}

impl Default for SymbolFilter {
    fn default() -> Self {
        Self::new("")
    }
}
