//! # Editing Operations
//!
//! LSP client editing operations.

use crate::error::EditorError;
use lsp_types::{Position, Url};

use super::LspClientState;

impl LspClientState {
    pub async fn format_document(
        &self,
        uri: Url,
    ) -> Result<Option<Vec<lsp_types::TextEdit>>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::DocumentFormattingParams {
            text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
            options: None,
            work_done_progress_params: Default::default(),
        };

        client.formatting(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn format_range(
        &self,
        uri: Url,
        range: lsp_types::Range,
    ) -> Result<Option<Vec<lsp_types::TextEdit>>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::DocumentRangeFormattingParams {
            text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
            range,
            options: None,
            work_done_progress_params: Default::default(),
        };

        client.range_formatting(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn rename_symbol(
        &self,
        uri: Url,
        position: Position,
        new_name: &str,
    ) -> Result<Option<lsp_types::WorkspaceEdit>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::RenameParams {
            text_document_position: lsp_types::TextDocumentPositionParams {
                text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
                position,
            },
            new_name: new_name.to_string(),
            work_done_progress_params: Default::default(),
        };

        client.rename(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn code_action(
        &self,
        uri: Url,
        range: lsp_types::Range,
    ) -> Result<Option<lsp_types::CodeActionResponse>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::CodeActionParams {
            text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
            range,
            context: None,
            diagnostics: None,
            only: None,
            resolve_provider: None,
        };

        client.code_action(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }
}
