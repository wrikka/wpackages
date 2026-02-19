//! # Hierarchy Client Trait
//!
//! Hierarchy client trait definition.

use async_trait::async_trait;
use lsp_types::*;

use crate::types::hierarchy::{Hierarchy, HierarchyDirection, HierarchyTree};

/// Hierarchy client trait
#[async_trait]
pub trait HierarchyClient: Send + Symbol {
    /// Get type hierarchy
    async fn type_hierarchy(
        &self,
        uri: url::Url,
        position: Position,
        direction: HierarchyDirection,
    ) -> HierarchyResult<Vec<TypeHierarchyItem>>;

    /// Prepare type hierarchy
    async fn prepare_type_hierarchy(
        &self,
        uri: url::Url,
        position: Position,
    ) -> HierarchyResult<Vec<TypeHierarchyItem>>;

    /// Get call hierarchy
    async fn call_hierarchy(
        &self,
        uri: url::Url,
        position: Position,
        direction: HierarchyDirection,
    ) -> HierarchyResult<Vec<CallHierarchyItem>>;

    /// Prepare call hierarchy
    async fn prepare_call_hierarchy(
        &self,
        uri: url::Url,
        position: Position,
    ) -> HierarchyResult<Vec<CallHierarchyItem>>;

    /// Get hierarchy tree
    async fn get_hierarchy_tree(
        &self,
        uri: url::Url,
        position: Position,
    ) -> HierarchyResult<HierarchyTree>;

    /// Update hierarchy for a file
    async fn update_hierarchy(
        &self,
        uri: url::Url,
        symbols: Vec<DocumentSymbol>,
    ) -> HierarchyResult<()>;

    /// Get all hierarchies
    async fn get_all_hierarchies(&self) -> HierarchyResult<Hierarchy>;

    /// Clear all hierarchies
    async fn clear(&self) -> HierarchyResult<()>;
}
