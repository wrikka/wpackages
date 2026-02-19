//! # Code Review Dashboard Types
//!
//! Types for the Smart Code Review Dashboard feature including PR summaries,
//! commit analysis, and quality scores.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Pull Request summary with AI-generated insights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrSummary {
    pub pr_number: u64,
    pub title: String,
    pub description: String,
    pub author: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub status: PrStatus,
    pub ai_insights: AiInsights,
    pub files_changed: Vec<FileChangeSummary>,
    pub reviewers: Vec<String>,
}

/// Pull Request status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PrStatus {
    Open,
    Closed,
    Merged,
    Draft,
}

/// AI-generated insights for a PR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiInsights {
    pub summary: String,
    pub key_changes: Vec<String>,
    pub potential_issues: Vec<PotentialIssue>,
    pub suggested_improvements: Vec<String>,
    pub complexity_score: f64,
    pub risk_level: RiskLevel,
}

/// Potential issue identified by AI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PotentialIssue {
    pub severity: IssueSeverity,
    pub category: IssueCategory,
    pub description: String,
    pub location: Option<String>,
    pub suggestion: Option<String>,
}

/// Issue severity level
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IssueSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Issue category
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueCategory {
    Security,
    Performance,
    Maintainability,
    Bug,
    Style,
    Documentation,
}

/// Risk level assessment
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
}

/// Summary of file changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChangeSummary {
    pub path: String,
    pub additions: u32,
    pub deletions: u32,
    pub change_type: ChangeType,
}

/// Type of change
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChangeType {
    Added,
    Modified,
    Deleted,
    Renamed,
}

/// Commit analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitAnalysis {
    pub commit_hash: String,
    pub message: String,
    pub author: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub files_affected: Vec<String>,
    pub analysis: CommitInsight,
}

/// Insight about a commit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitInsight {
    pub purpose: String,
    pub impact_areas: Vec<String>,
    pub breaking_changes: bool,
    pub test_coverage: Option<f64>,
    pub related_issues: Vec<String>,
}

/// Code quality score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityScore {
    pub overall: f64,
    pub maintainability: f64,
    pub test_coverage: f64,
    pub documentation: f64,
    pub complexity: f64,
    pub security: f64,
    pub breakdown: HashMap<String, f64>,
}

/// Review checklist item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewChecklistItem {
    pub id: String,
    pub title: String,
    pub description: String,
    pub checked: bool,
    pub category: ChecklistCategory,
}

/// Checklist category
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChecklistCategory {
    Functionality,
    Performance,
    Security,
    Style,
    Documentation,
    Testing,
}

/// Complete review dashboard state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewDashboard {
    pub pr_summary: Option<PrSummary>,
    pub commit_analyses: Vec<CommitAnalysis>,
    pub quality_score: Option<QualityScore>,
    pub checklist: Vec<ReviewChecklistItem>,
    pub filters: ReviewFilters,
}

/// Filters for review dashboard
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewFilters {
    pub author: Option<String>,
    pub time_range: Option<TimeRange>,
    pub severity: Option<IssueSeverity>,
    pub file_pattern: Option<String>,
}

/// Time range filter
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: chrono::DateTime<chrono::Utc>,
    pub end: chrono::DateTime<chrono::Utc>,
}
