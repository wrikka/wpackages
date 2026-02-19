//! # Code Review Dashboard Component
//!
//! UI component for the Smart Code Review Dashboard feature.

mod render_checklist;
mod render_commit_analyses;
mod render_filters;
mod render_pr_summary;
mod render_quality_score;

use crate::types::review_dashboard_types::*;
use egui::*;

pub use render_checklist::render_checklist;
pub use render_commit_analyses::render_commit_analyses;
pub use render_filters::render_filters;
pub use render_pr_summary::render_pr_summary;
pub use render_quality_score::render_quality_score;

/// Code review dashboard component
pub struct ReviewDashboardComponent {
    dashboard: ReviewDashboard,
    selected_pr: Option<u64>,
    show_checklist: bool,
    show_quality_score: bool,
}

impl ReviewDashboardComponent {
    /// Create a new review dashboard component
    pub fn new() -> Self {
        Self {
            dashboard: ReviewDashboard {
                pr_summary: None,
                commit_analyses: vec![],
                quality_score: None,
                checklist: vec![],
                filters: ReviewFilters {
                    author: None,
                    time_range: None,
                    severity: None,
                    file_pattern: None,
                },
            },
            selected_pr: None,
            show_checklist: true,
            show_quality_score: true,
        }
    }

    /// Set the dashboard data
    pub fn set_dashboard(&mut self, dashboard: ReviewDashboard) {
        self.dashboard = dashboard;
    }

    /// Render the dashboard
    pub fn render(&mut self, ui: &mut egui::Ui) {
        ui.heading("Code Review Dashboard");
        ui.separator();

        // Render filters
        render_filters(&self.dashboard.filters, ui);
        ui.separator();

        // Render PR summary if available
        if let Some(ref pr_summary) = self.dashboard.pr_summary {
            render_pr_summary(pr_summary, ui);
            ui.separator();
        }

        // Render commit analyses
        if !self.dashboard.commit_analyses.is_empty() {
            render_commit_analyses(&self.dashboard.commit_analyses, ui);
            ui.separator();
        }

        // Render quality score
        if self.show_quality_score {
            if let Some(ref quality_score) = self.dashboard.quality_score {
                render_quality_score(quality_score, ui);
                ui.separator();
            }
        }

        // Render checklist
        if self.show_checklist && !self.dashboard.checklist.is_empty() {
            render_checklist(&mut self.dashboard.checklist, ui);
        }
    }
}

impl Default for ReviewDashboardComponent {
    fn default() -> Self {
        Self::new()
    }
}
