use super::DocumentLoader;
use crate::domain::Document;
use crate::error::{RagError, RagResult};
use async_trait::async_trait;
use docx_rs::read_docx;
use std::fs::File;
use std::io::Read;

pub struct DocxLoader;

#[async_trait]
impl DocumentLoader for DocxLoader {
    async fn load(&self, path: &str) -> RagResult<Vec<Document>> {
        let mut file = File::open(path).map_err(|e| RagError::DocumentLoading(e.to_string()))?;
        let mut buf = Vec::new();
        file.read_to_end(&mut buf).map_err(|e| RagError::DocumentLoading(e.to_string()))?;
        let docx = read_docx(&buf).map_err(|e| RagError::DocumentLoading(e.to_string()))?;
        let content = docx.into_body().into_text();
        Ok(vec![Document::new(path, content)])
    }
}
