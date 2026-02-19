//! # Review Statistics
//!
//! Methods for calculating review statistics.

use crate::types::review_dashboard::{ReviewItem, ReviewStats};

impl super::ReviewDashboardService {
    pub fn calculate_stats(reviews: &[ReviewItem]) -> ReviewStats {
        let mut stats = ReviewStats::default();
        stats.total_reviews = reviews.len();

        for review in reviews {
            match review.status {
                crate::types::review_dashboard::ReviewStatus::Pending => {
                    stats.pending_reviews += 1
                }
                crate::types::review_dashboard::ReviewStatus::InProgress => {
                    stats.in_progress_reviews += 1
                }
                crate::types::review_dashboard::ReviewStatus::Approved => {
                    stats.approved_reviews += 1
                }
                crate::types::review_dashboard::ReviewStatus::Rejected => {
                    stats.rejected_reviews += 1
                }
                crate::types::review_dashboard::ReviewStatus::NeedsChanges => {
                    stats.needs_changes_reviews += 1
                }
            }

            stats.total_files_changed += review.files_changed;
            stats.total_insertions += review.insertions;
            stats.total_deletions += review.deletions;

            *stats.by_repo.entry(review.repo_name.clone()).or_insert(0) += 1;
            *stats.by_author.entry(review.author.clone()).or_insert(0) += 1;
        }

        stats
    }
}
