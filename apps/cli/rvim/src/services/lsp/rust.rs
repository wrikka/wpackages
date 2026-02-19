use crate::error::Result;
use async_trait::async_trait;
use lsp_types::{
    CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity, HoverContents, Location,
    Position, Range, Uri,
};
use std::path::PathBuf;

use super::traits::LspProvider;

pub struct RustLspProvider;

#[async_trait]
impl LspProvider for RustLspProvider {
    async fn get_completions(&self, _line: usize, _column: usize) -> Result<Vec<CompletionItem>> {
        Ok(vec![
            CompletionItem {
                label: "fn".to_string(),
                kind: Some(CompletionItemKind::FUNCTION),
                detail: Some("function keyword".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "let".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("variable declaration".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "impl".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("implementation block".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "struct".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("structure definition".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "enum".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("enumeration".to_string()),
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
            "Rust function or variable".to_string(),
        )))
    }

    async fn go_to_definition(
        &self,
        file_path: PathBuf,
        line: usize,
        column: usize,
    ) -> Result<Option<Location>> {
        let url_str = format!("file://{}", file_path.display());
        let uri: Uri = url_str.parse().unwrap(); // Should be safe
        Ok(Some(Location {
            uri,
            range: Range {
                start: Position::new(line as u32, column as u32),
                end: Position::new(line as u32, column as u32 + 10),
            },
        }))
    }
}
