use super::DocumentLoader;
use crate::domain::Document;
use crate::error::{RagError, RagResult};
use async_trait::async_trait;

pub struct PdfLoader;

#[async_trait]
impl DocumentLoader for PdfLoader {
    async fn load(&self, path: &str) -> RagResult<Vec<Document>> {
        let content = pdf_extract::extract_text(path).map_err(|e| RagError::DocumentLoading(e.to_string()))?;
        Ok(vec![Document::new(path, content)])
    }
}
