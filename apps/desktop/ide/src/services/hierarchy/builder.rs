//! # Hierarchy Builder
//!
//! Hierarchy building logic from LSP symbols.

use lsp_types::*;

use crate::types::hierarchy::{HierarchyItem, HierarchyKind, HierarchyTree};
use url::Url;

/// Hierarchy builder trait
pub trait HierarchyBuilder {
    fn build_hierarchy_from_symbols(&self, symbols: Vec<DocumentSymbol>, uri: Url) -> HierarchyItem;
    fn build_hierarchy_item(&self, symbol: &DocumentSymbol, uri: Url) -> HierarchyItem;
}

/// Default hierarchy builder
pub struct DefaultHierarchyBuilder;

impl HierarchyBuilder for DefaultHierarchyBuilder {
    fn build_hierarchy_from_symbols(&self, symbols: Vec<DocumentSymbol>, uri: Url) -> HierarchyItem {
        // Find the root symbol (usually a class or module)
        if let Some(root_symbol) = symbols.first() {
            let kind = HierarchyKind::from_symbol_kind(root_symbol.kind());
            let mut root = HierarchyItem::new(
                root_symbol.name.clone(),
                kind,
                uri.clone(),
                root_symbol.range,
            );

            // Add children recursively
            if let Some(children) = &root_symbol.children {
                for child in children {
                    let child_item = self.build_hierarchy_item(child, uri.clone());
                    root.add_child(child_item);
                }
            }

            root
        } else {
            HierarchyItem::new(
                "root",
                HierarchyKind::Type,
                uri,
                Range::new(Position::new(0, 0), Position::new(0, 0)),
            )
        }
    }

    fn build_hierarchy_item(&self, symbol: &DocumentSymbol, uri: Url) -> HierarchyItem {
        let kind = HierarchyKind::from_symbol_kind(symbol.kind());
        let mut item = HierarchyItem::new(
            symbol.name.clone(),
            kind,
            uri.clone(),
            symbol.range,
        );

        if let Some(children) = &symbol.children {
            for child in children {
                let child_item = self.build_hierarchy_item(child, uri.clone());
                item.add_child(child_item);
            }
        }

        item
    }
}
