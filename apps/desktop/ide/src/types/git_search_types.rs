//! # Git Search Types
//!
//! Types for the Advanced Search & Navigation feature including
//! semantic search, regex, and multi-repo search.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Git search engine state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitSearchEngine {
    pub index: SearchIndex,
    pub queries: Vec<SavedQuery>,
    pub current_query: Option<SearchQuery>,
    pub results: Vec<SearchResult>,
    pub settings: SearchSettings,
}

/// Search index
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchIndex {
    pub commits: Vec<IndexedCommit>,
    pub files: Vec<IndexedFile>,
    pub branches: Vec<IndexedBranch>,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

/// Indexed commit for search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexedCommit {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub files: Vec<String>,
    pub diff_summary: String,
    pub semantic_embedding: Option<Vec<f32>>,
}

/// Indexed file for search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexedFile {
    pub path: String,
    pub language: String,
    pub content_hash: String,
    pub last_modified: chrono::DateTime<chrono::Utc>,
    pub size_bytes: u64,
}

/// Indexed branch for search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexedBranch {
    pub name: String,
    pub head_commit: String,
    pub commit_count: u32,
    pub last_activity: chrono::DateTime<chrono::Utc>,
}

/// Search query
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub query: String,
    pub search_type: SearchType,
    pub scope: SearchScope,
    pub filters: SearchFilters,
    pub limit: Option<usize>,
}

/// Type of search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SearchType {
    Text,
    Regex,
    Semantic,
    Fuzzy,
}

/// Search scope
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SearchScope {
    Commits,
    Files,
    Branches,
    All,
}

/// Search filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchFilters {
    pub author: Option<String>,
    pub time_range: Option<TimeRange>,
    pub file_pattern: Option<String>,
    pub branch: Option<String>,
    pub language: Option<String>,
}

/// Time range filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: chrono::DateTime<chrono::Utc>,
    pub end: chrono::DateTime<chrono::Utc>,
}

/// Search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub result_type: SearchResultType,
    pub id: String,
    pub title: String,
    pub snippet: String,
    pub relevance_score: f64,
    pub metadata: SearchResultMetadata,
}

/// Type of search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SearchResultType {
    Commit,
    File,
    Branch,
}

/// Metadata for search results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResultMetadata {
    pub author: Option<String>,
    pub timestamp: Option<chrono::DateTime<chrono::Utc>>,
    pub file_path: Option<String>,
    pub branch: Option<String>,
    pub language: Option<String>,
}

/// Saved query
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedQuery {
    pub id: String,
    pub name: String,
    pub query: SearchQuery,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_used: Option<chrono::DateTime<chrono::Utc>>,
}

/// Search settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSettings {
    pub case_sensitive: bool,
    pub whole_word: bool,
    pub max_results: usize,
    pub enable_semantic: bool,
    pub semantic_model: Option<String>,
    pub fuzzy_threshold: f64,
}

/// Multi-repo search configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiRepoSearch {
    pub repos: Vec<RepoConfig>,
    pub parallel: bool,
    pub merge_results: bool,
}

/// Repository configuration for multi-repo search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepoConfig {
    pub name: String,
    pub path: String,
    pub enabled: bool,
    pub priority: u32,
}

/// Search statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchStats {
    pub total_results: usize,
    pub search_duration_ms: u64,
    pub results_by_type: HashMap<String, usize>,
    pub query_complexity: f64,
}
