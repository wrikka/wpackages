use super::DocumentLoader;
use crate::domain::Document;
use crate::error::{RagError, RagResult};
use async_trait::async_trait;
use std::fs;

pub struct TextLoader;

#[async_trait]
impl DocumentLoader for TextLoader {
    async fn load(&self, path: &str) -> RagResult<Vec<Document>> {
        let content = fs::read_to_string(path).map_err(|e| RagError::DocumentLoading(e.to_string()))?;
        Ok(vec![Document::new(path, content)])
    }
}
