//! # CI/CD Failure Analysis Types
//!
//! Types for analyzing pipeline failures and AI-generated insights.

use serde::{Deserialize, Serialize};

/// Failure analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailureAnalysis {
    pub run_id: String,
    pub pipeline_name: String,
    pub failure_type: FailureType,
    pub root_cause: String,
    pub affected_jobs: Vec<String>,
    pub suggested_fixes: Vec<String>,
    pub similar_failures: Vec<String>,
    pub ai_insights: Option<AiFailureInsights>,
}

/// Type of failure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FailureType {
    TestFailure,
    BuildError,
    DependencyIssue,
    Timeout,
    Infrastructure,
    Configuration,
    Unknown,
}

/// AI-generated failure insights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiFailureInsights {
    pub summary: String,
    pub likely_cause: String,
    pub confidence: f64,
    pub recommended_actions: Vec<String>,
}
