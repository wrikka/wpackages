use super::Chunker;
use crate::domain::{Document, TextChunk};
use crate::error::RagResult;
use async_trait::async_trait;
use punkt::SentenceTokenizer;

pub struct SemanticChunker {
    chunk_size: usize,
    chunk_overlap: usize,
}

impl SemanticChunker {
    pub fn new(chunk_size: usize, chunk_overlap: usize) -> Self {
        Self { chunk_size, chunk_overlap }
    }
}

#[async_trait]
impl Chunker for SemanticChunker {
    async fn chunk_document(&self, document: &Document) -> RagResult<Vec<TextChunk>> {
        let sentences: Vec<&str> = SentenceTokenizer::new(&document.content).collect();
        let mut chunks = Vec::new();
        let mut current_chunk = String::new();
        let mut chunk_index = 0;

        for sentence in sentences {
            if current_chunk.len() + sentence.len() > self.chunk_size {
                chunks.push(TextChunk::new(
                    format!("{}-{}", document.id, chunk_index),
                    document.id.clone(),
                    current_chunk.trim().to_string(),
                ));
                chunk_index += 1;
                current_chunk = current_chunk[current_chunk.len().saturating_sub(self.chunk_overlap)..].to_string();
            }
            current_chunk.push_str(sentence);
            current_chunk.push(' ');
        }

        if !current_chunk.trim().is_empty() {
            chunks.push(TextChunk::new(
                format!("{}-{}", document.id, chunk_index),
                document.id.clone(),
                current_chunk.trim().to_string(),
            ));
        }

        if let Some(metadata) = &document.metadata {
            for chunk in chunks.iter_mut() {
                chunk.metadata = Some(metadata.clone());
            }
        }

        Ok(chunks)
    }
}
