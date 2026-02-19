//! # CI/CD Dashboard Actions
//!
//! Actions for managing CI/CD dashboard state.

use crate::app::state::IdeState;
use crate::types::ci_dashboard::*;

/// Load CI dashboard
pub async fn load_ci_dashboard(state: &mut IdeState, filters: CiFilters) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_dashboard(filters.clone()).await {
            Ok(dashboard) => {
                state.ci_dashboard = dashboard;
            }
            Err(e) => {
                state.set_error(format!("Failed to load CI dashboard: {}", e));
            }
        }
    }
}

/// Refresh CI dashboard
pub async fn refresh_ci_dashboard(state: &mut IdeState) {
    let filters = state.ci_dashboard.filters.clone();
    load_ci_dashboard(state, filters).await;
}

/// Clear CI dashboard
pub fn clear_ci_dashboard(state: &mut IdeState) {
    state.ci_dashboard = CiDashboard {
        pipelines: vec![],
        active_runs: vec![],
        recent_failures: vec![],
        deployment_history: vec![],
        filters: CiFilters {
            pipeline: None,
            status: None,
            environment: None,
            time_range: None,
            branch: None,
        },
    };
}
