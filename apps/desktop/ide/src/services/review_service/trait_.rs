use crate::error::AppError;
use crate::types::review_dashboard_types::*;
use async_trait::async_trait;

/// Result type for review operations
pub type ReviewResult<T> = Result<T, AppError>;

/// Review dashboard service trait
#[async_trait]
pub trait ReviewService: Send + Sync {
    /// Get PR summary with AI insights
    async fn get_pr_summary(&self, pr_number: u64) -> ReviewResult<PrSummary>;

    /// Analyze commits in a PR
    async fn analyze_commits(&self, pr_number: u64) -> ReviewResult<Vec<CommitAnalysis>>;

    /// Calculate quality score for a PR
    async fn calculate_quality_score(&self, pr_number: u64) -> ReviewResult<QualityScore>;

    /// Get review checklist
    async fn get_checklist(&self, pr_number: u64) -> ReviewResult<Vec<ReviewChecklistItem>>;

    /// Update checklist item
    async fn update_checklist_item(
        &self,
        pr_number: u64,
        item_id: &str,
        checked: bool,
    ) -> ReviewResult<()>;

    /// Get review dashboard state
    async fn get_dashboard(&self, filters: ReviewFilters) -> ReviewResult<ReviewDashboard>;
}
