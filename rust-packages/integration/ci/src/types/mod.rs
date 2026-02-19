//! # CI/CD Types Module
//!
//! Data structures and traits for CI/CD integration

pub mod status;
pub mod models;

pub use status::{PipelineStatus};
pub use models::{CiStatus, CiStatusProvider, JobStatus, StageStatus};
