//! Editor enhancement feature states

use super::*;

/// Editor enhancement feature states
#[derive(Debug)]
pub struct EditorEnhancementState {
    pub lsp_client: LspClientState,
    pub multi_cursor: MultiCursorState,
    pub code_folding: CodeFoldingState,
    pub navigation: NavigationState,
    pub search: SearchState,
    pub minimap: MinimapState,
    pub breadcrumbs: BreadcrumbsState,
    pub outline: OutlineState,
    pub hierarchy: HierarchyState,
}

impl Default for EditorEnhancementState {
    fn default() -> Self {
        Self {
            lsp_client: LspClientState::default(),
            multi_cursor: MultiCursorState::default(),
            code_folding: CodeFoldingState::default(),
            navigation: NavigationState::default(),
            search: SearchState::default(),
            minimap: MinimapState::default(),
            breadcrumbs: BreadcrumbsState::default(),
            outline: OutlineState::default(),
            hierarchy: HierarchyState::default(),
        }
    }
}
