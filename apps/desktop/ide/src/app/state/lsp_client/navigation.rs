//! # Navigation Operations
//!
//! LSP client navigation operations.

use crate::error::EditorError;
use lsp_types::{Position, Url};

use super::LspClientState;

impl LspClientState {
    pub async fn goto_definition(
        &self,
        uri: Url,
        position: Position,
    ) -> Result<Option<lsp_types::GotoDefinitionResponse>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::GotoDefinitionParams {
            text_document_position_params: lsp_types::TextDocumentPositionParams {
                text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
                position,
            },
            work_done_progress_params: Default::default(),
        };

        client.goto_definition(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_references(
        &self,
        uri: Url,
        position: Position,
        include_declaration: bool,
    ) -> Result<Option<Vec<lsp_types::Location>>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::ReferenceParams {
            text_document_position_params: lsp_types::TextDocumentPositionParams {
                text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
                position,
            },
            context: lsp_types::ReferenceContext {
                include_declaration,
            },
            work_done_progress_params: Default::default(),
        };

        client.references(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_document_symbols(
        &self,
        uri: Url,
    ) -> Result<Option<lsp_types::DocumentSymbolResponse>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        let params = lsp_types::DocumentSymbolParams {
            text_document: lsp_types::TextDocumentIdentifier { uri: uri.clone() },
            work_done_progress_params: Default::default(),
            partial_result_params: Default::default(),
        };

        client.document_symbol(params).await.map_err(|e| EditorError::Other(e.to_string()))
    }

    pub async fn get_workspace_symbols(
        &self,
        query: &str,
    ) -> Result<Vec<lsp_types::SymbolInformation>, EditorError> {
        let client = self.get_client().await?.ok_or_else(|| EditorError::Other("LSP client not initialized".to_string()))?;

        client.workspace_symbols(query).await.map_err(|e| EditorError::Other(e.to_string()))
    }
}
