//! Symbol sorting functionality.
//!
//! This module contains symbol sorting logic and algorithms.

use lsp_types::{Position, Range, SymbolKind, Url};
use std::cmp::Ordering;

use super::types::Symbol;

/// Symbol sorter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SymbolSortBy {
    Name,
    Kind,
    Location,
    Relevance { query: String },
}

impl SymbolSortBy {
    /// Sort symbols by the specified criteria.
    pub fn sort(&self, symbols: &mut [Symbol]) {
        match self {
            SymbolSortBy::Name => {
                symbols.sort_by(|a, b| a.name.cmp(&b.name));
            }
            SymbolSortBy::Kind => {
                symbols.sort_by(|a, b| {
                    // SymbolKind is a struct wrapper around i32, compare using unsafe transmute
                    // This is safe because SymbolKind is #[repr(transparent)] wrapper around i32
                    unsafe {
                        let a_val = std::mem::transmute::<lsp_types::SymbolKind, i32>(a.kind);
                        let b_val = std::mem::transmute::<lsp_types::SymbolKind, i32>(b.kind);
                        a_val.cmp(&b_val).then_with(|| a.name.cmp(&b.name))
                    }
                });
            }
            SymbolSortBy::Location => {
                symbols.sort_by(|a, b| {
                    match a.location.uri.as_str().cmp(b.location.uri.as_str()) {
                        Ordering::Equal => {
                            let a_pos = a.location.position();
                            let b_pos = b.location.position();
                            match a_pos.line.cmp(&b_pos.line) {
                                Ordering::Equal => a_pos.character.cmp(&b_pos.character),
                                other => other,
                            }
                        }
                        other => other,
                    }
                });
            }
            SymbolSortBy::Relevance { query } => {
                // Sort by name match quality first, then by kind
                symbols.sort_by(|a, b| {
                    let a_score = self.relevance_score(query, a);
                    let b_score = self.relevance_score(query, b);
                    b_score.cmp(&a_score)
                });
            }
        }
    }

    /// Calculate relevance score for a symbol based on query.
    fn relevance_score(&self, query: &str, symbol: &Symbol) -> i32 {
        let mut score = 0;

        // Exact match gets highest score
        if symbol.name.eq_ignore_ascii_case(query) {
            score += 100;
        } else if symbol.name.starts_with(query) {
            score += 50;
        } else if symbol.name.contains(query) {
            score += 25;
        }

        // Prefer functions and classes
        if symbol.is_function() {
            score += 10;
        } else if symbol.is_class() {
            score += 5;
        }

        // Penalize deprecated symbols
        if symbol.deprecated {
            score -= 20;
        }

        score
    }
}
