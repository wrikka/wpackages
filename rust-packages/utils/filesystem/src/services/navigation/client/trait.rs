//! Navigation client trait definition.
//!
//! This module contains the core navigation trait that defines
//! all navigation operations that can be performed.

use crate::navigation::error::{NavigationError, NavigationResult};
use crate::navigation::reference::{ReferenceFilter, ReferenceSearchResult};
use crate::navigation::symbol::{SymbolScope, SymbolSearchResult};
use crate::navigation::types::{
    NavigationBookmarks, NavigationHistory, NavigationHistoryEntry, NavigationOptions,
    NavigationTarget,
};
use async_trait::async_trait;
use lsp_types::{
    DocumentSymbolResponse, GotoDefinitionResponse, Location, Position, ReferencesOptions,
    SymbolInformation, Url,
};

/// Navigation client trait
#[async_trait]
pub trait NavigationClient: Send + Sync {
    /// Go to definition
    async fn goto_definition(
        &self,
        uri: Url,
        position: Position,
    ) -> NavigationResult<Option<GotoDefinitionResponse>>;

    /// Go to type definition
    async fn goto_type_definition(
        &self,
        uri: Url,
        position: Position,
    ) -> NavigationResult<Option<GotoDefinitionResponse>>;

    /// Go to implementation
    async fn goto_implementation(
        &self,
        uri: Url,
        position: Position,
    ) -> NavigationResult<Option<GotoDefinitionResponse>>;

    /// Find references
    async fn find_references(
        &self,
        uri: Url,
        position: Position,
        options: ReferencesOptions,
    ) -> NavigationResult<Vec<Location>>;

    /// Document symbols
    async fn document_symbols(&self, uri: Url) -> NavigationResult<Option<DocumentSymbolResponse>>;

    /// Workspace symbols
    async fn workspace_symbols(&self, query: &str) -> NavigationResult<Vec<SymbolInformation>>;

    /// Navigate to target
    async fn navigate_to(&self, target: NavigationTarget) -> NavigationResult<()>;

    /// Get navigation history
    async fn get_history(&self) -> NavigationResult<NavigationHistory>;

    /// Go back in history
    async fn go_back(&self) -> NavigationResult<Option<NavigationHistoryEntry>>;

    /// Go forward in history
    async fn go_forward(&self) -> NavigationResult<Option<NavigationHistoryEntry>>;

    /// Get bookmarks
    async fn get_bookmarks(&self) -> NavigationResult<NavigationBookmarks>;

    /// Add bookmark
    async fn add_bookmark(&self, name: String, target: NavigationTarget) -> NavigationResult<()>;

    /// Remove bookmark
    async fn remove_bookmark(&self, name: String) -> NavigationResult<Option<NavigationTarget>>;

    /// Search symbols
    async fn search_symbols(
        &self,
        query: &str,
        scope: SymbolScope,
        options: NavigationOptions,
    ) -> NavigationResult<SymbolSearchResult>;

    /// Search references
    async fn search_references(
        &self,
        uri: Url,
        position: Position,
        filter: ReferenceFilter,
    ) -> NavigationResult<ReferenceSearchResult>;
}
