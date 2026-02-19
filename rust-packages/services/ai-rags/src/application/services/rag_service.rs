use crate::config::{ChunkingStrategy, EmbeddingProviderConfig, ReRankerConfig, SummarizerConfig, VectorStoreConfig};
use crate::core::summarizers::{BertSummarizer, NoOpSummarizer, Summarizer};
use crate::core::rerankers::{MmrReRanker, ReRanker};
use crate::infrastructure::vector_stores::QdrantVectorStore;
use crate::core::chunkers::{Chunker, SemanticChunker, SimpleChunker};
use crate::config::RagConfig;
use crate::core::filtering::metadata_equals;
use crate::core::retrieval::hybrid_retrieve;
use crate::adapter::document_loader::get_loader;
use crate::domain::{Document, MetadataFilter, RagQuery, RagResponse, RetrievalResult, TextChunk};
use crate::error::RagResult;
use crate::{
    EmbeddingProvider, InMemoryBm25, InMemoryVectorStore, MockEmbeddingProvider, OpenAIEmbeddingProvider,
    SparseRetriever, VectorStore,
};
use crate::constants::DEFAULT_EMBEDDING_DIM;
use std::collections::{HashMap, HashSet};
use std::env;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct RagService {
        chunker: Arc<dyn Chunker>,
    config: Arc<RwLock<RagConfig>>,
    embedding_provider: Arc<dyn EmbeddingProvider>,
    vector_store: Arc<dyn VectorStore>,
        sparse_retriever: Arc<dyn SparseRetriever>,
        reranker: Arc<dyn ReRanker>,
    summarizer: Arc<dyn Summarizer>,
}

impl RagService {
        pub async fn new(config: RagConfig) -> RagResult<Self> {
        config
            .validate()
            .unwrap_or_else(|e| panic!("Invalid config: {}", e));

                let chunker: Arc<dyn Chunker> = match config.chunking_strategy {
            ChunkingStrategy::Simple => Arc::new(SimpleChunker::new(
                config.chunk_size,
                config.chunk_overlap,
            )),
            ChunkingStrategy::Semantic => Arc::new(SemanticChunker::new(
                config.chunk_size,
                config.chunk_overlap,
            )),
        };

                let embedding_provider: Arc<dyn EmbeddingProvider> = match &config.embedding_provider {
            EmbeddingProviderConfig::OpenAI { model } => {
                let api_key = env::var("OPENAI_API_KEY").expect("OPENAI_API_KEY must be set");
                Arc::new(OpenAIEmbeddingProvider::new(api_key, model.clone()))
            }
            EmbeddingProviderConfig::Mock => {
                Arc::new(MockEmbeddingProvider::new(DEFAULT_EMBEDDING_DIM))
            }
        };
                let vector_store: Arc<dyn VectorStore> = match &config.vector_store {
            VectorStoreConfig::InMemory => Arc::new(InMemoryVectorStore::new()),
            VectorStoreConfig::Qdrant { url, collection_name } => {
                Arc::new(QdrantVectorStore::new(url, collection_name).await?)
            }
        };
                let sparse_retriever: Arc<dyn SparseRetriever> = Arc::new(InMemoryBm25::new());

                let reranker: Arc<dyn ReRanker> = match &config.reranker {
            ReRankerConfig::Mmr { lambda } => Arc::new(MmrReRanker::new(*lambda)),
            ReRankerConfig::None => Arc::new(NoOpReRanker),
        };

        let summarizer: Arc<dyn Summarizer> = match &config.summarizer {
            SummarizerConfig::Bert => Arc::new(BertSummarizer::new()?),            SummarizerConfig::None => Arc::new(NoOpSummarizer),
        };
            ReRankerConfig::Mmr { lambda } => Arc::new(MmrReRanker::new(*lambda)),
            ReRankerConfig::None => Arc::new(NoOpReRanker),
        };

        Ok(Self {
            chunker,
            config: Arc::new(RwLock::new(config)),
            embedding_provider,
            vector_store,
                        sparse_retriever,
                        reranker,
            summarizer,
        }))
    }

        pub async fn add_document(&self, path: &str) -> RagResult<Vec<TextChunk>> {
        let loader = get_loader(path)?;
        let documents = loader.load(path).await?;
        self.add_documents(documents).await
    }

        pub async fn add_documents(&self, documents: Vec<Document>) -> RagResult<Vec<TextChunk>> {
                let chunks = self.chunker.chunk_documents(&documents).await?;

        let texts: Vec<String> = chunks.iter().map(|c| c.text.clone()).collect();
        let embeddings = self.embedding_provider.generate_embeddings(&texts).await?;

        self.vector_store.add_batch(&chunks, &embeddings).await?;

        self.sparse_retriever.add_batch(&chunks).await?;

        Ok(chunks)
    }

            pub async fn retrieve(
        &self,
        query: &str,
        paths: &[&str],
        filter: Option<&MetadataFilter>,
    ) -> RagResult<RetrievalResult> {
        if !paths.is_empty() {
            let mut documents = Vec::new();
            for path in paths {
                let loader = get_loader(path)?;
                documents.extend(loader.load(path).await?);
            }
            self.add_documents(documents).await?;
        }

        let config = self.config.read().await;
        let top_k = config.top_k;
        let dense_weight = config.dense_weight;
        let sparse_weight = config.sparse_weight;

        let query_embedding = self.embedding_provider.generate_embedding(query).await?;
        
                hybrid_retrieve(
            query,
            &query_embedding,
            self.vector_store.clone(),
            self.sparse_retriever.clone(),
            top_k,
            dense_weight,
            sparse_weight,
            filter,
        )
        .await
    }

    pub async fn generate(&self, query: &str, context: &[TextChunk]) -> RagResult<String> {
        let context_text = context
            .iter()
            .map(|c| c.text.as_str())
            .collect::<Vec<_>>()
            .join("\n\n");

        Ok(format!("Query: {}\n\nContext:\n{}", query, context_text))
    }

            pub async fn query(&self, query: &str, paths: &[&str]) -> RagResult<String> {
        let retrieval = self.retrieve(query, paths, None).await?;
        let response = self.generate(query, &retrieval.chunks).await?;
        Ok(response)
    }

    pub async fn query_with_options(&self, rag_query: RagQuery) -> RagResult<RagResponse> {
        let config = self.config.read().await;

        let top_k = rag_query.options.top_k.unwrap_or(config.top_k);
        let min_similarity = rag_query
            .options
            .min_similarity
            .unwrap_or(config.min_similarity);

                let filter = rag_query.options.metadata_equals.as_ref().map(|filters| {
            let mut mf = MetadataFilter::default();
            mf.filters = filters.clone();
            mf
        });

        let retrieval = self
            .retrieve(&rag_query.query, &[], filter.as_ref())
            .await?;

        let mut candidates: Vec<(TextChunk, f32)> = retrieval
            .chunks
            .into_iter()
            .zip(retrieval.scores.into_iter())
            .collect();

        if let Some(allowed) = rag_query.options.allowed_document_ids.as_ref() {
            let allowed_set: HashSet<&str> = allowed.iter().map(|s| s.as_str()).collect();
            candidates.retain(|(c, _)| allowed_set.contains(c.document_id.as_str()));
        }

        
        if rag_query.options.enable_dedup {
            let mut seen: HashSet<String> = HashSet::new();
            candidates.retain(|(c, _)| {
                let key = blake3::hash(c.text.as_bytes()).to_hex().to_string();
                seen.insert(key)
            });
        }

        candidates.retain(|(_, score)| *score >= min_similarity);

                let selected = self.reranker.rerank(candidates, top_k).await?;
            candidates.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
            candidates.into_iter().take(top_k).map(|(c, _)| c).collect()
        };

        let answer = self.generate(&rag_query.query, &selected).await?;

        let sources = selected
            .iter()
            .map(|c| c.document_id.clone())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        Ok(RagResponse::new(answer, "rag-model".to_string())
            .with_context(selected)
            .with_sources(sources))
    }

    pub async fn get_config(&self) -> RagConfig {
        let config = self.config.read().await;
        config.clone()
    }

        pub async fn summarize(&self, text: &str) -> RagResult<String> {
        self.summarizer.summarize(text).await
    }

    pub async fn set_config(&self, config: RagConfig) -> RagResult<()> {
        config.validate()?;
        let mut cfg = self.config.write().await;
        *cfg = config;
        Ok(())
    }
}
