//! # Status Icon Utilities
//!
//! Shared utilities for rendering status icons across components.

use egui::Color32;

/// Get icon for run status
pub fn run_status_icon(status: &crate::types::ci_dashboard::RunStatus) -> &'static str {
    match status {
        crate::types::ci_dashboard::RunStatus::Pending => "⏳",
        crate::types::ci_dashboard::RunStatus::Running => "🔄",
        crate::types::ci_dashboard::RunStatus::Success => "✅",
        crate::types::ci_dashboard::RunStatus::Failed => "❌",
        crate::types::ci_dashboard::RunStatus::Cancelled => "⏹",
        crate::types::ci_dashboard::RunStatus::Skipped => "⏭",
    }
}

/// Get icon for pipeline status
pub fn pipeline_status_icon(status: &crate::types::ci_dashboard::PipelineStatus) -> &'static str {
    match status {
        crate::types::ci_dashboard::PipelineStatus::Active => "🟢",
        crate::types::ci_dashboard::PipelineStatus::Paused => "⏸",
        crate::types::ci_dashboard::PipelineStatus::Disabled => "🔴",
    }
}

/// Get icon for failure type
pub fn failure_type_icon(failure_type: &crate::types::ci_dashboard::FailureType) -> &'static str {
    match failure_type {
        crate::types::ci_dashboard::FailureType::TestFailure => "🧪",
        crate::types::ci_dashboard::FailureType::BuildError => "🔨",
        crate::types::ci_dashboard::FailureType::DependencyIssue => "📦",
        crate::types::ci_dashboard::FailureType::Timeout => "⏰",
        crate::types::ci_dashboard::FailureType::Infrastructure => "🖥",
        crate::types::ci_dashboard::FailureType::Configuration => "⚙️",
        crate::types::ci_dashboard::FailureType::Unknown => "❓",
    }
}

/// Get icon for deployment status
pub fn deployment_status_icon(status: &crate::types::ci_dashboard::DeploymentStatus) -> &'static str {
    match status {
        crate::types::ci_dashboard::DeploymentStatus::InProgress => "🔄",
        crate::types::ci_dashboard::DeploymentStatus::Success => "✅",
        crate::types::ci_dashboard::DeploymentStatus::Failed => "❌",
        crate::types::ci_dashboard::DeploymentStatus::RolledBack => "⏪",
    }
}

/// Get color for relevance score
pub fn relevance_score_color(score: f32) -> Color32 {
    if score >= 0.8 {
        Color32::GREEN
    } else if score >= 0.5 {
        Color32::YELLOW
    } else {
        Color32::RED
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_run_status_icon() {
        assert_eq!(run_status_icon(&crate::types::ci_dashboard::RunStatus::Success), "✅");
        assert_eq!(run_status_icon(&crate::types::ci_dashboard::RunStatus::Failed), "❌");
    }

    #[test]
    fn test_pipeline_status_icon() {
        assert_eq!(pipeline_status_icon(&crate::types::ci_dashboard::PipelineStatus::Active), "🟢");
    }

    #[test]
    fn test_relevance_score_color() {
        assert_eq!(relevance_score_color(0.9), Color32::GREEN);
        assert_eq!(relevance_score_color(0.6), Color32::YELLOW);
        assert_eq!(relevance_score_color(0.3), Color32::RED);
    }
}
