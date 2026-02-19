use crate::error::RagResult;
use crate::types::{Document, TextChunk};

pub struct Chunker {
    chunk_size: usize,
    chunk_overlap: usize,
}

impl Chunker {
    pub fn new(chunk_size: usize, chunk_overlap: usize) -> Self {
        Self {
            chunk_size,
            chunk_overlap,
        }
    }

    pub fn chunk_document(&self, document: &Document) -> RagResult<Vec<TextChunk>> {
        let mut chunks = self.chunk_text(&document.content, &document.id)?;

        if let Some(metadata) = &document.metadata {
            for chunk in chunks.iter_mut() {
                chunk.metadata = Some(metadata.clone());
            }
        }

        Ok(chunks)
    }

    pub fn chunk_documents(&self, documents: &[Document]) -> RagResult<Vec<TextChunk>> {
        let mut all_chunks = Vec::new();

        for document in documents {
            let chunks = self.chunk_document(document)?;
            all_chunks.extend(chunks);
        }

        Ok(all_chunks)
    }

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

    pub fn get_chunk_size(&self) -> usize {
        self.chunk_size
    }

    pub fn get_chunk_overlap(&self) -> usize {
        self.chunk_overlap
    }
}

pub struct DocumentProcessor {
    chunker: Chunker,
}

impl DocumentProcessor {
    pub fn new(chunk_size: usize, chunk_overlap: usize) -> Self {
        Self {
            chunker: Chunker::new(chunk_size, chunk_overlap),
        }
    }

    pub fn process(&self, document: Document) -> RagResult<Vec<TextChunk>> {
        self.chunker.chunk_document(&document)
    }

    pub fn process_batch(&self, documents: Vec<Document>) -> RagResult<Vec<TextChunk>> {
        self.chunker.chunk_documents(&documents)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chunker() {
        let chunker = Chunker::new(10, 2);
        let document = Document::new("doc1", "This is a test document for chunking");

        let chunks = chunker.chunk_document(&document).unwrap();
        assert!(!chunks.is_empty());
        assert_eq!(chunks[0].document_id, "doc1");
    }

    #[test]
    fn test_chunker_empty_document() {
        let chunker = Chunker::new(10, 2);
        let document = Document::new("doc1", "");

        let chunks = chunker.chunk_document(&document).unwrap();
        assert!(chunks.is_empty());
    }

    #[test]
    fn test_document_processor() {
        let processor = DocumentProcessor::new(10, 2);
        let document = Document::new("doc1", "Test document");

        let chunks = processor.process(document).unwrap();
        assert!(!chunks.is_empty());
    }
}
