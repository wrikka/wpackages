use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticMatch {
    pub path: String,
    pub score: f32,
    pub start_line: usize,
    pub end_line: usize,
    pub snippet: String,
}

#[derive(Error, Debug)]
pub enum SemanticError {
    #[error("semantic search error: {0}")]
    Search(String),
    #[error("semantic feature not enabled")]
    FeatureNotEnabled,
}

#[cfg(feature = "semantic")]
pub async fn search(root: &str, query: &str, limit: usize, config: &crate::config::Config) -> Result<Vec<SemanticMatch>, SemanticError> {
    let embeddings_url = config.semantic.as_ref()
        .and_then(|s| s.embeddings_url.as_deref())
        .unwrap_or("http://127.0.0.1:3000/embeddings");

    let results = semantic_search::search(root, query, limit, &embeddings_url).await
        .map_err(|e| SemanticError::Search(e.to_string()))?;

    let converted_results = results.into_iter().map(|r| SemanticMatch {
        path: r.path,
        score: r.score,
        start_line: r.start_line,
        end_line: r.end_line,
        snippet: r.snippet,
    }).collect();

    Ok(converted_results)
}

#[cfg(not(feature = "semantic"))]
pub async fn search(_root: &str, _query: &str, _limit: usize, _config: &crate::config::Config) -> Result<Vec<SemanticMatch>, SemanticError> {
    Err(SemanticError::FeatureNotEnabled)
}
