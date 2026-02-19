use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReviewStatus {
    Pending,
    InProgress,
    Approved,
    Rejected,
    NeedsChanges,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewItem {
    pub id: String,
    pub repo_name: String,
    pub repo_root: String,
    pub branch: String,
    pub commit_id: String,
    pub commit_message: String,
    pub author: String,
    pub files_changed: usize,
    pub insertions: usize,
    pub deletions: usize,
    pub status: ReviewStatus,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub priority: ReviewPriority,
    pub labels: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReviewPriority {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewFilter {
    pub search: String,
    pub status: Option<ReviewStatus>,
    pub priority: Option<ReviewPriority>,
    pub author: Option<String>,
    pub repo: Option<String>,
    pub date_from: Option<chrono::DateTime<chrono::Utc>>,
    pub date_to: Option<chrono::DateTime<chrono::Utc>>,
}

impl Default for ReviewFilter {
    fn default() -> Self {
        Self {
            search: String::new(),
            status: None,
            priority: None,
            author: None,
            repo: None,
            date_from: None,
            date_to: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewStats {
    pub total_reviews: usize,
    pub pending_reviews: usize,
    pub in_progress_reviews: usize,
    pub approved_reviews: usize,
    pub rejected_reviews: usize,
    pub needs_changes_reviews: usize,
    pub total_files_changed: usize,
    pub total_insertions: usize,
    pub total_deletions: usize,
    pub by_repo: HashMap<String, usize>,
    pub by_author: HashMap<String, usize>,
}

impl Default for ReviewStats {
    fn default() -> Self {
        Self {
            total_reviews: 0,
            pending_reviews: 0,
            in_progress_reviews: 0,
            approved_reviews: 0,
            rejected_reviews: 0,
            needs_changes_reviews: 0,
            total_files_changed: 0,
            total_insertions: 0,
            total_deletions: 0,
            by_repo: HashMap::new(),
            by_author: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewDashboardState {
    pub reviews: Vec<ReviewItem>,
    pub selected_review: Option<String>,
    pub filter: ReviewFilter,
    pub stats: ReviewStats,
    pub show_stats: bool,
    pub sort_by: ReviewSortBy,
    pub sort_ascending: bool,
}

impl Default for ReviewDashboardState {
    fn default() -> Self {
        Self {
            reviews: Vec::new(),
            selected_review: None,
            filter: ReviewFilter::default(),
            stats: ReviewStats::default(),
            show_stats: true,
            sort_by: ReviewSortBy::CreatedAt,
            sort_ascending: false,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReviewSortBy {
    CreatedAt,
    Priority,
    Status,
    RepoName,
    Author,
    FilesChanged,
}
