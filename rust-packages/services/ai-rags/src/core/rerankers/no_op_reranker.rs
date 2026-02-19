use super::ReRanker;
use crate::domain::TextChunk;
use crate::error::RagResult;
use async_trait::async_trait;

pub struct NoOpReRanker;

#[async_trait]
impl ReRanker for NoOpReRanker {
    async fn rerank(
        &self,
        candidates: Vec<(TextChunk, f32)>,
        top_k: usize,
    ) -> RagResult<Vec<TextChunk>> {
        let mut candidates = candidates;
        candidates.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        Ok(candidates.into_iter().take(top_k).map(|(c, _)| c).collect())
    }
}
