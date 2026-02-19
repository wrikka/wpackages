use crate::error::Result;
use async_trait::async_trait;
use lsp_types::{
    CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity, HoverContents, Location,
    Position, Range, Uri,
};
use std::path::PathBuf;

use super::traits::LspProvider;

pub struct PythonLspProvider;

#[async_trait]
impl LspProvider for PythonLspProvider {
    async fn get_completions(&self, _line: usize, _column: usize) -> Result<Vec<CompletionItem>> {
        Ok(vec![
            CompletionItem {
                label: "def".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("function definition".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "class".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("class definition".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "import".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("import statement".to_string()),
                ..Default::default()
            },
        ])
    }

    async fn get_diagnostics(&self, content: &str) -> Result<Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();

        if content.contains("TODO") {
            diagnostics.push(Diagnostic {
                range: Range {
                    start: Position::new(0, 0),
                    end: Position::new(0, 10),
                },
                severity: Some(DiagnosticSeverity::INFORMATION),
                code: None,
                source: Some("rvim".to_string()),
                message: "TODO item found".to_string(),
                ..Default::default()
            });
        }

        Ok(diagnostics)
    }

    async fn get_hover(&self, _line: usize, _column: usize) -> Result<HoverContents> {
        Ok(HoverContents::Scalar(lsp_types::MarkedString::String(
            "Python function or variable".to_string(),
        )))
    }

    async fn go_to_definition(
        &self,
        file_path: PathBuf,
        line: usize,
        column: usize,
    ) -> Result<Option<Location>> {
        let url_str = format!("file://{}", file_path.display());
        let uri: Uri = url_str.parse().unwrap();
        Ok(Some(Location {
            uri,
            range: Range {
                start: Position::new(line as u32, column as u32),
                end: Position::new(line as u32, column as u32 + 10),
            },
        }))
    }
}
