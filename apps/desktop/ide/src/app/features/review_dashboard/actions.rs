//! # Code Review Dashboard Actions
//!
//! Actions for the Smart Code Review Dashboard feature.

use crate::app::state::IdeState;
use crate::types::review_dashboard_types::*;
use crate::services::review_service::ReviewService;
use std::sync::Arc;

/// Load PR summary into the dashboard
pub async fn load_pr_summary(state: &mut IdeState, pr_number: u64) {
    state.clear_error();

    if let Some(review_service) = &state.services.review_service {
        match review_service.get_pr_summary(pr_number).await {
            Ok(summary) => {
                state.features.review_analysis.review_dashboard.pr_summary = Some(summary);
            }
            Err(e) => {
                state.set_error(format!("Failed to load PR summary: {}", e));
            }
        }
    }
}

/// Load commit analyses for a PR
pub async fn load_commit_analyses(state: &mut IdeState, pr_number: u64) {
    state.clear_error();

    if let Some(review_service) = &state.services.review_service {
        match review_service.analyze_commits(pr_number).await {
            Ok(analyses) => {
                state.features.review_analysis.review_dashboard.commit_analyses = analyses;
            }
            Err(e) => {
                state.set_error(format!("Failed to load commit analyses: {}", e));
            }
        }
    }
}

/// Load quality score for a PR
pub async fn load_quality_score(state: &mut IdeState, pr_number: u64) {
    state.clear_error();

    if let Some(review_service) = &state.services.review_service {
        match review_service.calculate_quality_score(pr_number).await {
            Ok(score) => {
                state.features.review_analysis.review_dashboard.quality_score = Some(score);
            }
            Err(e) => {
                state.set_error(format!("Failed to load quality score: {}", e));
            }
        }
    }
}

/// Load review checklist for a PR
pub async fn load_checklist(state: &mut IdeState, pr_number: u64) {
    state.clear_error();

    if let Some(review_service) = &state.services.review_service {
        match review_service.get_checklist(pr_number).await {
            Ok(checklist) => {
                state.features.review_analysis.review_dashboard.checklist = checklist;
            }
            Err(e) => {
                state.set_error(format!("Failed to load checklist: {}", e));
            }
        }
    }
}

/// Update checklist item
pub async fn update_checklist_item(
    state: &mut IdeState,
    pr_number: u64,
    item_id: &str,
    checked: bool,
) {
    state.clear_error();

    if let Some(review_service) = &state.services.review_service {
        match review_service.update_checklist_item(pr_number, item_id, checked).await {
            Ok(()) => {
                // Update local state
                if let Some(item) = state
                    .features
                    .review_analysis
                    .review_dashboard
                    .checklist
                    .iter_mut()
                    .find(|i| i.id == item_id)
                {
                    item.checked = checked;
                }
            }
            Err(e) => {
                state.set_error(format!("Failed to update checklist item: {}", e));
            }
        }
    }
}

/// Apply filters to review dashboard
pub async fn apply_review_filters(state: &mut IdeState, filters: ReviewFilters) {
    state.clear_error();

    if let Some(review_service) = &state.services.review_service {
        match review_service.get_dashboard(filters.clone()).await {
            Ok(dashboard) => {
                state.features.review_analysis.review_dashboard = dashboard;
            }
            Err(e) => {
                state.set_error(format!("Failed to apply filters: {}", e));
            }
        }
    }
}

/// Refresh all review dashboard data
pub async fn refresh_review_dashboard(state: &mut IdeState, pr_number: u64) {
    load_pr_summary(state, pr_number).await;
    load_commit_analyses(state, pr_number).await;
    load_quality_score(state, pr_number).await;
    load_checklist(state, pr_number).await;
}

/// Clear review dashboard
pub fn clear_review_dashboard(state: &mut IdeState) {
    state.features.review_analysis.review_dashboard = crate::types::review_dashboard_types::ReviewDashboard {
        pr_summary: None,
        commit_analyses: vec![],
        quality_score: None,
        checklist: vec![],
        filters: ReviewFilters {
            author: None,
            time_range: None,
            severity: None,
            file_pattern: None,
        },
    };
}
