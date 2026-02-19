use super::{DocxLoader, DocumentLoader, MarkdownLoader, PdfLoader, TextLoader, UrlLoader};
use crate::error::{RagError, RagResult};
use std::path::Path;

pub fn get_loader(path: &str) -> RagResult<Box<dyn DocumentLoader>> {
    if path.starts_with("http://") || path.starts_with("https://") {
        return Ok(Box::new(UrlLoader));
    }

    let extension = Path::new(path)
        .extension()
        .and_then(|s| s.to_str())
        .ok_or_else(|| RagError::DocumentLoading("Failed to get file extension".to_string()))?;

    match extension.to_lowercase().as_str() {
        "pdf" => Ok(Box::new(PdfLoader)),
        "docx" => Ok(Box::new(DocxLoader)),
        "txt" => Ok(Box::new(TextLoader)),
        "md" => Ok(Box::new(MarkdownLoader)),
        _ => Err(RagError::DocumentLoading(format!(
            "Unsupported file extension: {}",
            extension
        ))),
    }
}
