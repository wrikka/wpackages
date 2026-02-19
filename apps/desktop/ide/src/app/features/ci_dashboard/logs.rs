//! # CI/CD Log Actions
//!
//! Actions for managing CI/CD pipeline logs.

use crate::app::state::IdeState;

/// Get pipeline run logs
pub async fn get_run_logs(state: &mut IdeState, run_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_run_logs(run_id).await {
            Ok(logs) => {
                state.run_logs = logs;
            }
            Err(e) => {
                state.set_error(format!("Failed to get logs: {}", e));
            }
        }
    }
}

/// Get job logs
pub async fn get_job_logs(state: &mut IdeState, run_id: &str, job_id: &str) {
    state.clear_error();

    if let Some(ci_service) = &state.ci_service {
        match ci_service.get_job_logs(run_id, job_id).await {
            Ok(logs) => {
                state.job_logs = logs;
            }
            Err(e) => {
                state.set_error(format!("Failed to get job logs: {}", e));
            }
        }
    }
}
