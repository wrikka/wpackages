//! # Document Operations
//!
//! LSP client document operations.

use crate::error::EditorError;
use lsp_types::Url;

use super::LspClientState;

impl LspClientState {
    pub async fn open_document(
        &self,
        uri: Url,
        language_id: impl Into<String>,
        text: impl Into<String>,
    ) -> Result<(), EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let text_document = lsp_types::TextDocumentItem {
            uri: uri.clone(),
            language_id: language_id.into(),
            version: 0,
            text: text.into(),
        };

        client.did_open(text_document).await.map_err(|e| EditorError::Other(e.to_string()))?;

        tracing::debug!("Opened document: {:?}", uri);

        Ok(())
    }

    pub async fn close_document(&self, uri: Url) -> Result<(), EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let text_document = lsp_types::TextDocumentIdentifier { uri: uri.clone() };

        client.did_close(text_document).await.map_err(|e| EditorError::Other(e.to_string()))?;

        tracing::debug!("Closed document: {:?}", uri);

        Ok(())
    }

    pub async fn get_diagnostics(&self, uri: Url) -> Result<Vec<lsp_types::Diagnostic>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        client.diagnostics(uri).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_semantic_tokens(
        &self,
        uri: Url,
    ) -> Result<Option<lsp_types::SemanticTokensResult>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::SemanticTokensParams {
            text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
            work_done_progress_params: Default::default(),
            partial_result_params: Default::default(),
        };

        client.semantic_tokens_full(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }
}
