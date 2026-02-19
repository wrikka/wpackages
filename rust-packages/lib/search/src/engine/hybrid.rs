use crate::engine::{fuzzy, semantic, text};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HybridMatch {
    pub path: String,
    pub line: usize,
    pub text: String,
    pub score: f64,
    pub sources: Vec<String>,
}

// Reciprocal Rank Fusion implementation
fn rrf(rank_lists: Vec<Vec<(String, usize, String)>>) -> Vec<HybridMatch> {
    let k = 60.0; // RRF constant
    let mut rrf_scores: HashMap<(String, usize, String), f64> = HashMap::new();

    for list in rank_lists {
        for (rank, (path, line, text)) in list.into_iter().enumerate() {
            let rank_score = 1.0 / (k + (rank as f64 + 1.0));
            *rrf_scores.entry((path, line, text)).or_insert(0.0) += rank_score;
        }
    }

    let mut final_results: Vec<_> = rrf_scores
        .into_iter()
        .map(|((path, line, text), score)| HybridMatch {
            path,
            line,
            text,
            score,
            sources: vec![], // Source tracking can be added back if needed
        })
        .collect();

    final_results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
    final_results
}

pub async fn search(root: &str, query: &str, limit: usize, config: &crate::config::Config) -> anyhow::Result<Vec<HybridMatch>> {
    // Run sync searches in parallel
    let (text_results, fuzzy_results) = rayon::join(
        || text::search(root, query, false, limit).unwrap_or_default(),
        || fuzzy::search(root, query, limit).unwrap_or_default(),
    );

    // Run async search
    let semantic_results = semantic::search(root, query, limit, config).await.unwrap_or_default();

    // Prepare lists for RRF
    let text_rank_list = text_results
        .into_iter()
        .map(|m| (m.path, m.line, m.text))
        .collect();

    let fuzzy_rank_list = fuzzy_results
        .into_iter()
        .map(|m| (m.path, m.line, m.text))
        .collect();

    let semantic_rank_list = semantic_results
        .into_iter()
        .map(|m| (m.path, m.start_line, m.snippet))
        .collect();

    let mut final_results = rrf(vec![text_rank_list, fuzzy_rank_list, semantic_rank_list]);
    final_results.truncate(limit);

    Ok(final_results)
}
