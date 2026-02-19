use crate::error::Result;
use async_trait::async_trait;
use lsp_types::{CompletionItem, Diagnostic, HoverContents, Location};
use std::path::PathBuf;

#[async_trait]
pub trait LspProvider {
    async fn get_completions(&self, line: usize, column: usize) -> Result<Vec<CompletionItem>>;
    async fn get_diagnostics(&self, content: &str) -> Result<Vec<Diagnostic>>;
    async fn get_hover(&self, line: usize, column: usize) -> Result<HoverContents>;
    async fn go_to_definition(
        &self,
        file_path: PathBuf,
        line: usize,
        column: usize,
    ) -> Result<Option<Location>>;
}
