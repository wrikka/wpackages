use super::Chunker;
use crate::domain::{Document, TextChunk};
use crate::error::RagResult;
use async_trait::async_trait;

pub struct SimpleChunker {
    chunk_size: usize,
    chunk_overlap: usize,
}

impl SimpleChunker {
    pub fn new(chunk_size: usize, chunk_overlap: usize) -> Self {
        Self { chunk_size, chunk_overlap }
    }
}

#[async_trait]
impl Chunker for SimpleChunker {
    async fn chunk_document(&self, document: &Document) -> RagResult<Vec<TextChunk>> {
        let mut chunks = self.chunk_text(&document.content, &document.id)?;

        if let Some(metadata) = &document.metadata {
            for chunk in chunks.iter_mut() {
                chunk.metadata = Some(metadata.clone());
            }
        }

        Ok(chunks)
    }
}

impl SimpleChunker {
    fn chunk_text(&self, text: &str, document_id: &str) -> RagResult<Vec<TextChunk>> {
        if text.is_empty() {
            return Ok(Vec::new());
        }

        let mut chunks = Vec::new();
        let chars: Vec<char> = text.chars().collect();
        let mut start = 0;
        let mut chunk_index = 0;

        while start < chars.len() {
            let end = (start + self.chunk_size).min(chars.len());
            let chunk_text: String = chars[start..end].iter().collect();

            let chunk = TextChunk::new(
                format!("{}-{}", document_id, chunk_index),
                document_id.to_string(),
                chunk_text,
            );

            chunks.push(chunk);
            chunk_index += 1;

            if end >= chars.len() {
                break;
            }

            start = end.saturating_sub(self.chunk_overlap);
        }

        Ok(chunks)
    }
}
