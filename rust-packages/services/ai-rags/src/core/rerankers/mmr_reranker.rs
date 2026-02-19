use super::ReRanker;
use crate::domain::TextChunk;
use crate::error::RagResult;
use async_trait::async_trait;
use std::collections::HashSet;

fn tokenize_set(text: &str) -> HashSet<String> {
    text.split_whitespace()
        .map(|t| t.trim_matches(|c: char| !c.is_alphanumeric()))
        .filter(|t| !t.is_empty())
        .map(|t| t.to_lowercase())
        .collect()
}

fn jaccard(a: &HashSet<String>, b: &HashSet<String>) -> f32 {
    if a.is_empty() && b.is_empty() {
        return 0.0;
    }

    let mut inter = 0usize;
    for x in a.iter() {
        if b.contains(x) {
            inter += 1;
        }
    }
    let union = a.len() + b.len() - inter;
    if union == 0 {
        0.0
    } else {
        (inter as f32) / (union as f32)
    }
}

pub struct MmrReRanker {
    lambda: f32,
}

impl MmrReRanker {
    pub fn new(lambda: f32) -> Self {
        Self { lambda: lambda.clamp(0.0, 1.0) }
    }
}

#[async_trait]
impl ReRanker for MmrReRanker {
    async fn rerank(
        &self,
        mut candidates: Vec<(TextChunk, f32)>,
        top_k: usize,
    ) -> RagResult<Vec<TextChunk>> {
        candidates.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        let mut selected: Vec<TextChunk> = Vec::new();
        let mut selected_texts: Vec<HashSet<String>> = Vec::new();

        while !candidates.is_empty() && selected.len() < top_k {
            let mut best_idx = 0usize;
            let mut best_score = f32::NEG_INFINITY;

            for (idx, (chunk, score)) in candidates.iter().enumerate() {
                let cand_tokens = tokenize_set(&chunk.text);

                let max_sim = selected_texts
                    .iter()
                    .map(|s| jaccard(&cand_tokens, s))
                    .fold(0.0, f32::max);

                let mmr = self.lambda * (*score) - (1.0 - self.lambda) * max_sim;
                if mmr > best_score {
                    best_score = mmr;
                    best_idx = idx;
                }
            }

            let (chosen, _) = candidates.remove(best_idx);
            selected_texts.push(tokenize_set(&chosen.text));
            selected.push(chosen);
        }

        Ok(selected)
    }
}
