//! # Completion Operations
//!
//! LSP client completion operations.

use crate::error::EditorError;
use lsp_types::{Position, Url};

use super::LspClientState;

impl LspClientState {
    pub async fn get_completion(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<Option<lsp_types::CompletionResponse>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::CompletionParams {
            text_document_position: lsp_types::TextDocumentPositionParams {
                text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
                position,
            },
            context: None,
            work_done_progress_params: Default::default(),
            partial_result_params: Default::default(),
        };

        client.completion(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_hover(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<Option<lsp_types::Hover>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::HoverParams {
            text_document_position_params: lsp_types::TextDocumentPositionParams {
                text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
                position,
            },
            work_done_progress_params: Default::default(),
        };

        client.hover(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_inlay_hints(
        &self,
        uri: Url,
        range: lsp_types::Range,
    ) -> Result<Option<Vec<lsp_types::InlayHint>>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::InlayHintParams {
            text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
            range,
            work_done_progress_params: Default::default(),
        };

        client.inlay_hint(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }
}
