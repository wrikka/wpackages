//! # Review Sorting
//!
//! Methods for sorting review items.

use crate::types::review_dashboard::{ReviewItem, ReviewPriority, ReviewSortBy, ReviewStatus};

impl super::ReviewDashboardService {
    pub fn sort_reviews(reviews: &mut [ReviewItem], sort_by: ReviewSortBy, ascending: bool) {
        reviews.sort_by(|a, b| {
            let cmp = match sort_by {
                ReviewSortBy::CreatedAt => a.created_at.cmp(&b.created_at),
                ReviewSortBy::Priority => {
                    Self::priority_value(&a.priority).cmp(&Self::priority_value(&b.priority))
                }
                ReviewSortBy::Status => {
                    Self::status_value(&a.status).cmp(&Self::status_value(&b.status))
                }
                ReviewSortBy::RepoName => a.repo_name.cmp(&b.repo_name),
                ReviewSortBy::Author => a.author.cmp(&b.author),
                ReviewSortBy::FilesChanged => a.files_changed.cmp(&b.files_changed),
            };

            if ascending { cmp } else { cmp.reverse() }
        });
    }

    fn priority_value(priority: &ReviewPriority) -> u8 {
        match priority {
            ReviewPriority::Critical => 0,
            ReviewPriority::High => 1,
            ReviewPriority::Medium => 2,
            ReviewPriority::Low => 3,
        }
    }

    fn status_value(status: &ReviewStatus) -> u8 {
        match status {
            ReviewStatus::Pending => 0,
            ReviewStatus::InProgress => 1,
            ReviewStatus::NeedsChanges => 2,
            ReviewStatus::Approved => 3,
            ReviewStatus::Rejected => 4,
        }
    }
}
