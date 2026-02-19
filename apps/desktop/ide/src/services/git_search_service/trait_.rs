use crate::error::AppError;
use crate::types::git_search_types::*;
use async_trait::async_trait;

/// Result type for search operations
pub type SearchResultType<T> = Result<T, AppError>;

/// Git search service trait
#[async_trait]
pub trait GitSearchService: Send + Sync {
    /// Initialize search index for a repository
    async fn initialize_index(&self, repo_path: &str) -> SearchResultType<()>;

    /// Search commits
    async fn search_commits(&self, query: &SearchQuery) -> SearchResultType<Vec<SearchResult>>;

    /// Search files
    async fn search_files(&self, query: &SearchQuery) -> SearchResultType<Vec<SearchResult>>;

    /// Search branches
    async fn search_branches(&self, query: &SearchQuery) -> SearchResultType<Vec<SearchResult>>;

    /// Semantic search
    async fn semantic_search(&self, intent: &str, repo_path: &str) -> SearchResultType<Vec<SearchResult>>;

    /// Regex search
    async fn regex_search(&self, pattern: &str, repo_path: &str) -> SearchResultType<Vec<SearchResult>>;

    /// Multi-repo search
    async fn multi_repo_search(&self, query: &SearchQuery, repos: &[RepoConfig]) -> SearchResultType<Vec<SearchResult>>;

    /// Save query
    async fn save_query(&self, query: &SearchQuery, name: &str) -> SearchResultType<SavedQuery>;

    /// Get saved queries
    async fn get_saved_queries(&self) -> SearchResultType<Vec<SavedQuery>>;

    /// Get search statistics
    async fn get_search_stats(&self, query: &SearchQuery) -> SearchResultType<SearchStats>;
}
