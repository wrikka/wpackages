use crate::error::{ChunkingError, ChunkingResult};
use crate::types::{Chunk, ChunkMetadata, ChunkingConfig, ChunkOutput, ChunkingStrategy, Chunker};
use crate::utils::split_sentences;

pub struct SemanticChunker {
    config: ChunkingConfig,
    embedding_model: Option<Box<dyn embeddings::services::EmbeddingProvider>>,
}

impl SemanticChunker {
    pub fn new(config: ChunkingConfig) -> Self {
        Self {
            config,
            embedding_model: None,
        }
    }

    pub fn with_embedding_model(
        mut self,
        model: Box<dyn embeddings::services::EmbeddingProvider>,
    ) -> Self {
        self.embedding_model = Some(model);
        self
    }

    fn semantic_split(
        &self,
        sentences: &[String],
        model: &dyn embeddings::services::EmbeddingProvider,
    ) -> ChunkingResult<Vec<Chunk>> {
        let mut chunks = Vec::new();
        let mut current_chunk = Vec::new();
        let mut current_size = 0;
        let mut start_index = 0;

        for (i, sentence) in sentences.iter().enumerate() {
            current_chunk.push(sentence.clone());
            current_size += sentence.len();

            if current_size >= self.config.chunk_size || i == sentences.len() - 1 {
                let chunk_text = current_chunk.join(" ");
                chunks.push(self.create_chunk(&chunk_text, start_index)?);
                start_index += chunk_text.len();
                current_chunk.clear();
                current_size = 0;
            }
        }

        Ok(chunks)
    }

    fn similarity_split(&self, sentences: &[String]) -> ChunkingResult<Vec<Chunk>> {
        let mut chunks = Vec::new();
        let mut current_chunk = Vec::new();
        let mut current_size = 0;
        let mut start_index = 0;

        for (i, sentence) in sentences.iter().enumerate() {
            let should_split = if !current_chunk.is_empty() {
                let last_sentence = current_chunk.last().unwrap();
                let similarity = self.compute_similarity(last_sentence, sentence);
                similarity < 0.5 || current_size + sentence.len() >= self.config.chunk_size
            } else {
                false
            };

            if should_split {
                let chunk_text = current_chunk.join(" ");
                chunks.push(self.create_chunk(&chunk_text, start_index)?);
                start_index += chunk_text.len();
                current_chunk.clear();
                current_size = 0;
            }

            current_chunk.push(sentence.clone());
            current_size += sentence.len();

            if i == sentences.len() - 1 && !current_chunk.is_empty() {
                let chunk_text = current_chunk.join(" ");
                chunks.push(self.create_chunk(&chunk_text, start_index)?);
            }
        }

        Ok(chunks)
    }

    fn compute_similarity(&self, text1: &str, text2: &str) -> f32 {
        let words1: std::collections::HashSet<&str> = text1.split_whitespace().collect();
        let words2: std::collections::HashSet<&str> = text2.split_whitespace().collect();

        if words1.is_empty() || words2.is_empty() {
            return 0.0;
        }

        let intersection = words1.intersection(&words2).count();
        let union = words1.union(&words2).count();

        intersection as f32 / union as f32
    }

    fn create_chunk(&self, content: &str, start_index: usize) -> ChunkingResult<Chunk> {
        let token_count = content.split_whitespace().count();
        let char_count = content.chars().count();

        Ok(Chunk {
            id: format!("semantic_chunk_{}", start_index),
            content: content.to_string(),
            start_index,
            end_index: start_index + char_count,
            metadata: ChunkMetadata {
                strategy: ChunkingStrategy::Semantic,
                language: None,
                token_count,
                char_count,
                overlap: self.config.chunk_overlap,
            },
        })
    }
}

impl Chunker for SemanticChunker {
    fn chunk(&self, text: &str) -> ChunkingResult<ChunkOutput> {
        if text.trim().is_empty() {
            return Err(ChunkingError::EmptyDocument);
        }

        let sentences = split_sentences(text);
        let chunks = if let Some(model) = &self.embedding_model {
            self.semantic_split(&sentences, model)?
        } else {
            self.similarity_split(&sentences)?
        };

        let total_tokens: usize = chunks.iter().map(|c| c.metadata.token_count).sum();

        Ok(ChunkOutput {
            chunks,
            total_chunks: chunks.len(),
            total_tokens,
            strategy: ChunkingStrategy::Semantic,
        })
    }

    fn strategy(&self) -> ChunkingStrategy {
        ChunkingStrategy::Semantic
    }
}

impl Default for SemanticChunker {
    fn default() -> Self {
        Self::new(ChunkingConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_semantic_chunker() {
        let chunker = SemanticChunker::default();
        let text = "This is sentence one. This is sentence two. This is sentence three.";

        let result = chunker.chunk(text).unwrap();
        assert!(!result.chunks.is_empty());
        assert_eq!(result.strategy, ChunkingStrategy::Semantic);
    }
}
