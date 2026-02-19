use crate::domain::TextChunk;
use crate::error::RagResult;
use async_trait::async_trait;

#[async_trait]
pub trait ReRanker: Send + Sync {
    async fn rerank(
        &self,
        candidates: Vec<(TextChunk, f32)>,
        top_k: usize,
    ) -> RagResult<Vec<TextChunk>>;
}

pub mod mmr_reranker;
pub mod no_op_reranker;


pub use mmr_reranker::MmrReRanker;
pub use no_op_reranker::NoOpReRanker;
