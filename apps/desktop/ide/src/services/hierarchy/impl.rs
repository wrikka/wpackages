//! # Hierarchy Client Implementation
//!
//! Hierarchy client implementation.

use crate::HierarchyError;
use crate::services::hierarchy::client::HierarchyClient;
use crate::services::hierarchy::builder::{HierarchyBuilder, DefaultHierarchyBuilder};
use crate::types::hierarchy::{Hierarchy, HierarchyKind, HierarchyTree};
use async_trait::async_trait;
use lsp_types::*;
use std::sync::{Arc, Mutex};
use tracing::info;
use url::Url;

/// Hierarchy client implementation
pub struct HierarchyClientImpl {
    hierarchy: Arc<Mutex<Hierarchy>>,
    builder: DefaultHierarchyBuilder,
}

impl HierarchyClientImpl {
    pub fn new() -> Self {
        Self {
            hierarchy: Arc::new(Mutex::new(Hierarchy::new())),
            builder: DefaultHierarchyBuilder,
        }
    }

    pub fn hierarchy(&self) -> Arc<Mutex<Hierarchy>> {
        self.hierarchy.clone()
    }

    fn build_type_hierarchy_tree(&self, uri: Url, items: Vec<TypeHierarchyItem>) -> HierarchyTree {
        let root = crate::types::hierarchy::HierarchyItem::new(
            "root",
            HierarchyKind::Type,
            uri.clone(),
            Range::new(Position::new(0, 0), Position::new(0, 0)),
        );

        let tree = HierarchyTree::new(root, uri, Position::new(0, 0));
        tree
    }

    fn build_call_hierarchy_tree(&self, uri: Url, items: Vec<CallHierarchyItem>) -> HierarchyTree {
        let root = crate::types::hierarchy::HierarchyItem::new(
            "root",
            HierarchyKind::Function,
            uri.clone(),
            Range::new(Position::new(0, 0), Position::new(0, 0)),
        );

        let tree = HierarchyTree::new(root, uri, Position::new(0, 0));
        tree
    }
}

impl Default for HierarchyClientImpl {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl HierarchyClient for HierarchyClientImpl {
    async fn type_hierarchy(
        &self,
        uri: Url,
        position: Position,
        direction: crate::types::hierarchy::HierarchyDirection,
    ) -> HierarchyResult<Vec<TypeHierarchyItem>> {
        info!("Getting type hierarchy for {:?} at {:?}", uri, position);

        // This would typically call the LSP client
        // For now, return empty result
        Ok(Vec::new())
    }

    async fn prepare_type_hierarchy(
        &self,
        uri: Url,
        position: Position,
    ) -> HierarchyResult<Vec<TypeHierarchyItem>> {
        info!("Preparing type hierarchy for {:?} at {:?}", uri, position);

        // This would typically call the LSP client
        // For now, return empty result
        Ok(Vec::new())
    }

    async fn call_hierarchy(
        &self,
        uri: Url,
        position: Position,
        direction: crate::types::hierarchy::HierarchyDirection,
    ) -> HierarchyResult<Vec<CallHierarchyItem>> {
        info!("Getting call hierarchy for {:?} at {:?}", uri, position);

        // This would typically call the LSP client
        // For now, return empty result
        Ok(Vec::new())
    }

    async fn prepare_call_hierarchy(
        &self,
        uri: Url,
        position: Position,
    ) -> HierarchyResult<Vec<CallHierarchyItem>> {
        info!("Preparing call hierarchy for {:?} at {:?}", uri, position);

        // This would typically call the LSP client
        // For now, return empty result
        Ok(Vec::new())
    }

    async fn get_hierarchy_tree(
        &self,
        uri: Url,
        position: Position,
    ) -> HierarchyResult<HierarchyTree> {
        info!("Getting hierarchy tree for {:?} at {:?}", uri, position);

        let hierarchy = self.hierarchy.lock().map_err(|e| HierarchyError::Other(e.to_string()))?;

        if let Some(tree) = hierarchy.get_tree(&uri) {
            Ok(tree.clone())
        } else {
            // Return empty tree if not found
            let root = crate::types::hierarchy::HierarchyItem::new(
                "root",
                HierarchyKind::Type,
                uri.clone(),
                Range::new(Position::new(0, 0), Position::new(0, 0)),
            );

            Ok(HierarchyTree::new(root, uri, position))
        }
    }

    async fn update_hierarchy(
        &self,
        uri: Url,
        symbols: Vec<DocumentSymbol>,
    ) -> HierarchyResult<()> {
        info!("Updating hierarchy for {:?}", uri);

        // Build hierarchy from symbols
        let root = self.builder.build_hierarchy_from_symbols(symbols, uri.clone());

        let tree = HierarchyTree::new(root, uri, Position::new(0, 0));

        let mut hierarchy = self.hierarchy.lock().map_err(|e| HierarchyError::Other(e.to_string()))?;
        hierarchy.add_tree(uri, tree);

        Ok(())
    }

    async fn get_all_hierarchies(&self) -> HierarchyResult<Hierarchy> {
        let hierarchy = self.hierarchy.lock().map_err(|e| HierarchyError::Other(e.to_string()))?;
        Ok(hierarchy.clone())
    }

    async fn clear(&self) -> HierarchyResult<()> {
        let mut hierarchy = self.hierarchy.lock().map_err(|e| HierarchyError::Other(e.to_string()))?;
        hierarchy.clear();
        Ok(())
    }
}

/// Create a new hierarchy client
pub fn create_hierarchy_client() -> HierarchyClientImpl {
    HierarchyClientImpl::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_hierarchy_client() {
        let client = create_hierarchy_client();

        let uri = Url::parse("file:///test.rs").expect("Failed to parse test URL");

        let symbols = vec![
            DocumentSymbol::Class(Class {
                name: "MyClass".to_string(),
                detail: Some("class MyClass".to_string()),
                kind: SymbolKind::CLASS,
                range: Range::new(Position::new(0, 0), Position::new(50, 0)),
                selection_range: None,
                children: None,
            }),
        ];

        client.update_hierarchy(uri, symbols).await.expect("Failed to update hierarchy");

        let hierarchy = client.get_all_hierarchies().await.expect("Failed to get hierarchies");
        assert_eq!(hierarchy.count(), 1);
    }
}
