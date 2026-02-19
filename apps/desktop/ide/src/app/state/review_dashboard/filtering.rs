//! # Review Filtering
//!
//! Methods for filtering review items.

use crate::types::review_dashboard::{ReviewFilter, ReviewItem};

impl super::ReviewDashboardService {
    pub fn filter_reviews(reviews: &[ReviewItem], filter: &ReviewFilter) -> Vec<ReviewItem> {
        reviews
            .iter()
            .filter(|review| {
                if !filter.search.is_empty() {
                    let search_lower = filter.search.to_lowercase();
                    let matches = review.commit_message.to_lowercase().contains(&search_lower)
                        || review.author.to_lowercase().contains(&search_lower)
                        || review.repo_name.to_lowercase().contains(&search_lower);
                    if !matches {
                        return false;
                    }
                }

                if let Some(status) = &filter.status {
                    if &review.status != status {
                        return false;
                    }
                }

                if let Some(priority) = &filter.priority {
                    if &review.priority != priority {
                        return false;
                    }
                }

                if let Some(author) = &filter.author {
                    if !review.author.contains(author) {
                        return false;
                    }
                }

                if let Some(repo) = &filter.repo {
                    if !review.repo_name.contains(repo) {
                        return false;
                    }
                }

                if let Some(from) = filter.date_from {
                    if review.created_at < from {
                        return false;
                    }
                }

                if let Some(to) = filter.date_to {
                    if review.created_at > to {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect()
    }
}
