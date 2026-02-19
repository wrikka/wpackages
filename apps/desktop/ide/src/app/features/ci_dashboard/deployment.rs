//! # CI/CD Deployment Actions
//!
//! Actions for managing CI/CD deployments.

use crate::app::state::IdeState;

/// Load deployment history
pub async fn load_deployment_history(state: &mut IdeState, environment: &str, limit: usize) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_deployment_history(environment, limit).await {
            Ok(deployments) => {
                state.ci_dashboard.deployment_history = deployments;
            }
            Err(e) => {
                state.set_error(format!("Failed to load deployment history: {}", e));
            }
        }
    }
}

/// Load deployment details
pub async fn load_deployment(state: &mut IdeState, deployment_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_deployment(deployment_id).await {
            Ok(deployment) => {
                state.selected_deployment = Some(deployment);
            }
            Err(e) => {
                state.set_error(format!("Failed to load deployment: {}", e));
            }
        }
    }
}
