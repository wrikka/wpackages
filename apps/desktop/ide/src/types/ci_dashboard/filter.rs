//! # CI/CD Filter Types
//!
//! Types for filtering CI/CD dashboard data.

use serde::{Deserialize, Serialize};

use super::run::RunStatus;

/// CI/CD filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CiFilters {
    pub pipeline: Option<String>,
    pub status: Option<RunStatus>,
    pub environment: Option<String>,
    pub time_range: Option<TimeRange>,
    pub branch: Option<String>,
}

/// Time range filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: chrono::DateTime<chrono::Utc>,
    pub end: chrono::DateTime<chrono::Utc>,
}
