use crate::error::{ChunkingError, ChunkingResult};
use crate::types::{Chunk, ChunkMetadata, ChunkingConfig, ChunkOutput, ChunkingStrategy, Chunker};

pub struct RecursiveChunker {
    config: ChunkingConfig,
}

impl RecursiveChunker {
    pub fn new(config: ChunkingConfig) -> Self {
        Self { config }
    }

    fn recursive_split(
        &self,
        text: &str,
        separators: &[String],
        depth: usize,
    ) -> ChunkingResult<Vec<Chunk>> {
        if separators.is_empty() {
            return self.split_by_size(text);
        }

        let separator = &separators[0];
        let parts: Vec<&str> = text.split(separator).collect();

        let good_splits: Vec<&str> = parts
            .into_iter()
            .filter(|part| part.len() >= self.config.min_chunk_size)
            .collect();

        if good_splits.is_empty() {
            return self.recursive_split(text, &separators[1..], depth + 1);
        }

        let mut chunks = Vec::new();
        let mut current_chunk = String::new();
        let mut start_index = 0;

        for (i, part) in good_splits.iter().enumerate() {
            let potential_chunk = if current_chunk.is_empty() {
                part.to_string()
            } else {
                format!("{}{}{}", current_chunk, separator, part)
            };

            if potential_chunk.len() <= self.config.chunk_size {
                current_chunk = potential_chunk;
            } else {
                if !current_chunk.is_empty() {
                    chunks.push(self.create_chunk(&current_chunk, start_index)?);
                    start_index += current_chunk.len();
                }
                current_chunk = part.to_string();
            }

            if i == good_splits.len() - 1 && !current_chunk.is_empty() {
                chunks.push(self.create_chunk(&current_chunk, start_index)?);
            }
        }

        if chunks.is_empty() {
            self.recursive_split(text, &separators[1..], depth + 1)
        } else {
            Ok(chunks)
        }
    }

    fn split_by_size(&self, text: &str) -> ChunkingResult<Vec<Chunk>> {
        let mut chunks = Vec::new();
        let chars: Vec<char> = text.chars().collect();
        let mut start = 0;

        while start < chars.len() {
            let end = (start + self.config.chunk_size).min(chars.len());
            let chunk_text: String = chars[start..end].iter().collect();

            chunks.push(self.create_chunk(&chunk_text, start)?);

            start = end.saturating_sub(self.config.chunk_overlap);
        }

        Ok(chunks)
    }

    fn create_chunk(&self, content: &str, start_index: usize) -> ChunkingResult<Chunk> {
        let token_count = content.split_whitespace().count();
        let char_count = content.chars().count();

        Ok(Chunk {
            id: format!("chunk_{}", start_index),
            content: content.to_string(),
            start_index,
            end_index: start_index + char_count,
            metadata: ChunkMetadata {
                strategy: ChunkingStrategy::Recursive,
                language: None,
                token_count,
                char_count,
                overlap: self.config.chunk_overlap,
            },
        })
    }
}

impl Chunker for RecursiveChunker {
    fn chunk(&self, text: &str) -> ChunkingResult<ChunkOutput> {
        if text.trim().is_empty() {
            return Err(ChunkingError::EmptyDocument);
        }

        let chunks = self.recursive_split(text, &self.config.separators, 0)?;
        let total_tokens: usize = chunks.iter().map(|c| c.metadata.token_count).sum();

        Ok(ChunkOutput {
            chunks,
            total_chunks: chunks.len(),
            total_tokens,
            strategy: ChunkingStrategy::Recursive,
        })
    }

    fn strategy(&self) -> ChunkingStrategy {
        ChunkingStrategy::Recursive
    }
}

impl Default for RecursiveChunker {
    fn default() -> Self {
        Self::new(ChunkingConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recursive_chunker() {
        let chunker = RecursiveChunker::default();
        let text = "This is paragraph one.\n\nThis is paragraph two.\n\nThis is paragraph three.";

        let result = chunker.chunk(text).unwrap();
        assert!(!result.chunks.is_empty());
        assert_eq!(result.strategy, ChunkingStrategy::Recursive);
    }
}
