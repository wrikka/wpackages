use crate::error::Result;
use async_trait::async_trait;
use lsp_types::{CompletionItem, Diagnostic, HoverContents, Location};
use std::path::PathBuf;

use super::traits::LspProvider;

pub struct GenericLspProvider;

#[async_trait]
impl LspProvider for GenericLspProvider {
    async fn get_completions(&self, _line: usize, _column: usize) -> Result<Vec<CompletionItem>> {
        Ok(vec![])
    }

    async fn get_diagnostics(&self, _content: &str) -> Result<Vec<Diagnostic>> {
        Ok(vec![])
    }

    async fn get_hover(&self, _line: usize, _column: usize) -> Result<HoverContents> {
        Ok(HoverContents::Scalar(lsp_types::MarkedString::String(
            "No information available".to_string(),
        )))
    }

    async fn go_to_definition(
        &self,
        _file_path: PathBuf,
        _line: usize,
        _column: usize,
    ) -> Result<Option<Location>> {
        Ok(None)
    }
}
