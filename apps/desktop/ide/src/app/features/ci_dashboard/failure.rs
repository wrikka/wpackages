//! # CI/CD Failure Actions
//!
//! Actions for managing CI/CD failure analysis.

use crate::app::state::IdeState;

/// Load recent failures
pub async fn load_recent_failures(state: &mut IdeState, limit: usize) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_recent_failures(limit).await {
            Ok(failures) => {
                state.ci_dashboard.recent_failures = failures;
            }
            Err(e) => {
                state.set_error(format!("Failed to load failures: {}", e));
            }
        }
    }
}

/// Analyze failure
pub async fn analyze_failure(state: &mut IdeState, run_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.analyze_failure(run_id).await {
            Ok(analysis) => {
                state.selected_failure_analysis = Some(analysis);
            }
            Err(e) => {
                state.set_error(format!("Failed to analyze failure: {}", e));
            }
        }
    }
}
