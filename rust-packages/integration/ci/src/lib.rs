//! # CI/CD Integration Library
//!
//! This library provides CI/CD integration for wterminal IDE including:
//! - GitHub Actions
//! - GitLab CI
//! - Jenkins

pub mod error;
pub mod types;
pub mod services;
pub mod adapters;
pub mod utils;
pub mod config;
pub mod constants;
pub mod telemetry;
pub mod prelude;

#[cfg(feature = "gitlab")]
pub mod gitlab;

#[cfg(feature = "jenkins")]
pub mod jenkins;

pub use error::{CiCdError, CiCdResult};
pub use types::{CiStatus, CiStatusProvider, JobStatus, PipelineStatus, StageStatus};
pub use services::github::GitHubActions;
pub use config::CiCdConfig;
