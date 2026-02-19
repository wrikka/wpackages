use crate::engine::semantic::{self, SemanticMatch};
use semantic_search::{SearchQuery, VectorIndex, VectorSearchConfig};

// This function finds code snippets semantically similar to a given query.
// It reuses much of the logic from the semantic search but is geared towards
// finding neighbors rather than direct matches.
pub async fn find_similar(
    root: &str,
    query: &str,
    limit: usize,
    config: &crate::config::Config,
) -> anyhow::Result<Vec<semantic::SemanticMatch>> {
    // This now correctly calls the async semantic search function with the config.
    semantic::search(root, query, limit, config).await
}
