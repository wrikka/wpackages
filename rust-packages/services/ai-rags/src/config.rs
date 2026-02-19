use crate::error::{RagError, RagResult};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ChunkingStrategy {
    Simple,
    Semantic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EmbeddingProviderConfig {
    OpenAI { model: String },
    Mock,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VectorStoreConfig {
    InMemory,
    Qdrant { url: String, collection_name: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReRankerConfig {
    None,
    Mmr { lambda: f32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SummarizerConfig {
    None,
    Bert,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RagConfig {
    pub summarizer: SummarizerConfig,
    pub reranker: ReRankerConfig,
    pub vector_store: VectorStoreConfig,
    pub embedding_provider: EmbeddingProviderConfig,
    pub chunking_strategy: ChunkingStrategy,
    pub chunk_size: usize,
    pub chunk_overlap: usize,
    pub top_k: usize,
    pub min_similarity: f32,
    pub dense_weight: f32,
    pub sparse_weight: f32,
}

impl RagConfig {
            pub fn new() -> Self {
        Self {
            summarizer: SummarizerConfig::None,
            reranker: ReRankerConfig::Mmr { lambda: 0.5 },
            vector_store: VectorStoreConfig::InMemory,
            embedding_provider: EmbeddingProviderConfig::OpenAI {
                model: "text-embedding-3-small".to_string(),
            },
            chunking_strategy: ChunkingStrategy::Simple,
            chunk_size: 512,
            chunk_overlap: 50,
            top_k: 5,
            min_similarity: 0.7,
            dense_weight: 1.0,
            sparse_weight: 0.0,
        }
    }

    pub fn with_chunk_size(mut self, size: usize) -> Self {
        self.chunk_size = size;
        self
    }

    pub fn with_chunk_overlap(mut self, overlap: usize) -> Self {
        self.chunk_overlap = overlap;
        self
    }

    pub fn with_top_k(mut self, k: usize) -> Self {
        self.top_k = k;
        self
    }

    pub fn with_min_similarity(mut self, sim: f32) -> Self {
        self.min_similarity = sim;
        self
    }

    pub fn with_dense_weight(mut self, weight: f32) -> Self {
        self.dense_weight = weight;
        self
    }

        pub fn with_sparse_weight(mut self, weight: f32) -> Self {
        self.sparse_weight = weight;
        self
    }

        pub fn with_chunking_strategy(mut self, strategy: ChunkingStrategy) -> Self {
        self.chunking_strategy = strategy;
        self
    }

        pub fn with_embedding_provider(mut self, provider: EmbeddingProviderConfig) -> Self {
        self.embedding_provider = provider;
        self
    }

        pub fn with_vector_store(mut self, store: VectorStoreConfig) -> Self {
        self.vector_store = store;
        self
    }

        pub fn with_reranker(mut self, reranker: ReRankerConfig) -> Self {
        self.reranker = reranker;
        self
    }

    pub fn with_summarizer(mut self, summarizer: SummarizerConfig) -> Self {
        self.summarizer = summarizer;
        self
    }

    pub fn validate(&self) -> RagResult<()> {
        if self.chunk_size == 0 {
            return Err(RagError::InvalidConfig(
                "Chunk size must be greater than 0".to_string(),
            ));
        }
        if self.chunk_overlap >= self.chunk_size {
            return Err(RagError::InvalidConfig(
                "Chunk overlap must be less than chunk size".to_string(),
            ));
        }
        if self.top_k == 0 {
            return Err(RagError::InvalidConfig(
                "Top k must be greater than 0".to_string(),
            ));
        }
        if !(0.0..=1.0).contains(&self.min_similarity) {
            return Err(RagError::InvalidConfig(
                "Min similarity must be between 0.0 and 1.0".to_string(),
            ));
        }
        if self.dense_weight < 0.0 {
            return Err(RagError::InvalidConfig(
                "Dense weight must be greater than or equal to 0.0".to_string(),
            ));
        }
        if self.sparse_weight < 0.0 {
            return Err(RagError::InvalidConfig(
                "Sparse weight must be greater than or equal to 0.0".to_string(),
            ));
        }
        if self.dense_weight == 0.0 && self.sparse_weight == 0.0 {
            return Err(RagError::InvalidConfig(
                "At least one of dense_weight or sparse_weight must be greater than 0.0"
                    .to_string(),
            ));
        }
        Ok(())
    }
}

impl Default for RagConfig {
    fn default() -> Self {
        Self::new()
    }
}
