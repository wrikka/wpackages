use crate::domain::{MetadataFilter, RetrievalResult, TextChunk};
use crate::{SparseRetriever, VectorStore};
use crate::error::RagResult;
use std::collections::HashMap;
use std::sync::Arc;

pub async fn hybrid_retrieve(
    query: &str,
    query_embedding: &[f32],
    vector_store: Arc<dyn VectorStore>,
    sparse_retriever: Arc<dyn SparseRetriever>,
    top_k: usize,
    dense_weight: f32,
    sparse_weight: f32,
    filter: Option<&MetadataFilter>,
) -> RagResult<RetrievalResult> {
        let dense_results = if dense_weight > 0.0 {
        vector_store.search(query_embedding, top_k, filter).await?
    } else {
        vec![]
    };

    let sparse_results = if sparse_weight > 0.0 {
        sparse_retriever.search(query, top_k).await?
    } else {
        vec![]
    };

    let mut merged: HashMap<String, (TextChunk, f32)> = HashMap::new();

    for (chunk, score) in dense_results {
        let entry = merged
            .entry(chunk.id.clone())
            .or_insert_with(|| (chunk.clone(), 0.0));
        entry.0 = chunk;
        entry.1 += dense_weight * score;
    }

    for (chunk, score) in sparse_results {
        let entry = merged
            .entry(chunk.id.clone())
            .or_insert_with(|| (chunk.clone(), 0.0));
        entry.0 = chunk;
        entry.1 += sparse_weight * score;
    }

    let mut merged_vec: Vec<(TextChunk, f32)> = merged.into_values().collect();
    merged_vec.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    merged_vec.truncate(top_k);

    let (chunks, scores): (Vec<TextChunk>, Vec<f32>) = merged_vec.into_iter().unzip();
    Ok(RetrievalResult::new(chunks, scores))
}
