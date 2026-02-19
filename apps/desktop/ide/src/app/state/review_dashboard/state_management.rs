//! # Review State Management
//!
//! Methods for managing review dashboard state.

use crate::types::review_dashboard::{ReviewDashboardState, ReviewItem, ReviewStatus};

impl super::ReviewDashboardService {
    pub fn update_review_status(
        state: &mut ReviewDashboardState,
        review_id: &str,
        status: ReviewStatus,
    ) {
        if let Some(review) = state.reviews.iter_mut().find(|r| r.id == review_id) {
            review.status = status;
            state.stats = Self::calculate_stats(&state.reviews);
        }
    }

    pub fn add_review(state: &mut ReviewDashboardState, review: ReviewItem) {
        state.reviews.push(review);
        Self::sort_reviews(&mut state.reviews, state.sort_by, state.sort_ascending);
        state.stats = Self::calculate_stats(&state.reviews);
    }

    pub fn remove_review(state: &mut ReviewDashboardState, review_id: &str) {
        state.reviews.retain(|r| r.id != review_id);
        state.selected_review = None;
        state.stats = Self::calculate_stats(&state.reviews);
    }
}
