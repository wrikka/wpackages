//! # CI/CD Pipeline Actions
//!
//! Actions for managing CI/CD pipelines and runs.

use crate::app::state::IdeState;
use crate::types::ci_dashboard::*;

use super::dashboard::refresh_ci_dashboard;

/// Load pipeline details
pub async fn load_pipeline(state: &mut IdeState, pipeline_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_pipeline(pipeline_id).await {
            Ok(pipeline) => {
                state.selected_pipeline = Some(pipeline);
            }
            Err(e) => {
                state.set_error(format!("Failed to load pipeline: {}", e));
            }
        }
    }
}

/// Load pipeline run details
pub async fn load_pipeline_run(state: &mut IdeState, run_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_pipeline_run(run_id).await {
            Ok(run) => {
                state.selected_pipeline_run = Some(run);
            }
            Err(e) => {
                state.set_error(format!("Failed to load pipeline run: {}", e));
            }
        }
    }
}

/// Trigger pipeline run
pub async fn trigger_pipeline(state: &mut IdeState, pipeline_id: &str, trigger: Trigger) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.trigger_pipeline(pipeline_id, trigger).await {
            Ok(run) => {
                state.set_info(format!("Pipeline run #{} triggered", run.run_number));
                refresh_ci_dashboard(state).await;
            }
            Err(e) => {
                state.set_error(format!("Failed to trigger pipeline: {}", e));
            }
        }
    }
}

/// Cancel pipeline run
pub async fn cancel_pipeline_run(state: &mut IdeState, run_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.cancel_run(run_id).await {
            Ok(()) => {
                state.set_info(format!("Pipeline run {} cancelled", run_id));
                refresh_ci_dashboard(state).await;
            }
            Err(e) => {
                state.set_error(format!("Failed to cancel run: {}", e));
            }
        }
    }
}

/// Retry failed run
pub async fn retry_pipeline_run(state: &mut IdeState, run_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.retry_run(run_id).await {
            Ok(run) => {
                state.set_info(format!("Pipeline run #{} retried", run.run_number));
                refresh_ci_dashboard(state).await;
            }
            Err(e) => {
                state.set_error(format!("Failed to retry run: {}", e));
            }
        }
    }
}
