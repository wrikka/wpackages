//! # Git Graph Service Trait
//!
//! Trait defining Git graph service operations.

use crate::error::AppError;
use crate::types::git_graph_types::*;
use async_trait::async_trait;
use std::collections::HashMap;

/// Result type for graph operations
pub type GraphResult<T> = Result<T, AppError>;

/// Git graph service trait
#[async_trait]
pub trait GraphService: Send + Sync {
    /// Get graph visualization state
    async fn get_graph(&self, repo_path: &str) -> GraphResult<GitGraph>;

    /// Get commits for the graph
    async fn get_commits(&self, repo_path: &str, limit: usize) -> GraphResult<Vec<CommitNode>>;

    /// Get branches for the graph
    async fn get_branches(&self, repo_path: &str) -> GraphResult<Vec<Branch>>;

    /// Get tags for the graph
    async fn get_tags(&self, repo_path: &str) -> GraphResult<Vec<Tag>>;

    /// Apply filters to the graph
    async fn apply_filters(&self, graph: &mut GitGraph, filters: GraphFilters) -> GraphResult<()>;

    /// Calculate node positions for visualization
    async fn calculate_positions(
        &self,
        commits: &[CommitNode],
        mode: GraphViewMode,
    ) -> GraphResult<HashMap<String, NodePosition>>;

    /// Get commit details
    async fn get_commit_details(&self, repo_path: &str, hash: &str) -> GraphResult<CommitNode>;

    /// Search commits in graph
    async fn search_commits(&self, repo_path: &str, query: &str) -> GraphResult<Vec<CommitNode>>;
}
