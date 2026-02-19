//! # CI/CD Dashboard Actions
//!
//! Actions for the CI/CD Pipeline Visualization feature.

mod dashboard;
mod deployment;
mod failure;
mod logs;
mod pipeline;

pub use dashboard::{clear_ci_dashboard, load_ci_dashboard, refresh_ci_dashboard};
pub use deployment::{load_deployment, load_deployment_history};
pub use failure::{analyze_failure, load_recent_failures};
pub use logs::{get_job_logs, get_run_logs};
pub use pipeline::{
    cancel_pipeline_run, load_pipeline, load_pipeline_run, retry_pipeline_run, trigger_pipeline,
};
