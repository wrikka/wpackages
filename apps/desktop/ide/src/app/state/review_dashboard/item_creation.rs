//! # Review Item Creation
//!
//! Methods for creating and initializing review items.

use crate::types::review_dashboard::{ReviewItem, ReviewPriority};
use git::types::{CommitSummary, RepoSummary};

impl super::ReviewDashboardService {
    pub fn create_review_item(
        repo: &RepoSummary,
        commit: &CommitSummary,
        files_changed: usize,
        insertions: usize,
        deletions: usize,
    ) -> ReviewItem {
        ReviewItem {
            id: format!("{}:{}", repo.root, commit.id),
            repo_name: repo.name.clone(),
            repo_root: repo.root.clone(),
            branch: "HEAD".to_string(),
            commit_id: commit.id.clone(),
            commit_message: commit.summary.clone(),
            author: commit.author.clone(),
            files_changed,
            insertions,
            deletions,
            status: crate::types::review_dashboard::ReviewStatus::Pending,
            created_at: chrono::Utc::now(),
            priority: Self::calculate_priority(files_changed, insertions + deletions),
            labels: Self::generate_labels(&commit.summary),
        }
    }

    fn calculate_priority(files_changed: usize, total_changes: usize) -> ReviewPriority {
        if files_changed > 50 || total_changes > 1000 {
            ReviewPriority::Critical
        } else if files_changed > 20 || total_changes > 500 {
            ReviewPriority::High
        } else if files_changed > 10 || total_changes > 200 {
            ReviewPriority::Medium
        } else {
            ReviewPriority::Low
        }
    }

    fn generate_labels(message: &str) -> Vec<String> {
        let mut labels = Vec::new();
        let msg_lower = message.to_lowercase();

        if msg_lower.contains("fix") || msg_lower.contains("bug") {
            labels.push("bugfix".to_string());
        }
        if msg_lower.contains("feat") || msg_lower.contains("feature") {
            labels.push("feature".to_string());
        }
        if msg_lower.contains("refactor") {
            labels.push("refactor".to_string());
        }
        if msg_lower.contains("test") {
            labels.push("test".to_string());
        }
        if msg_lower.contains("docs") || msg_lower.contains("documentation") {
            labels.push("docs".to_string());
        }
        if msg_lower.contains("breaking") || msg_lower.contains("major") {
            labels.push("breaking".to_string());
        }

        labels
    }
}
