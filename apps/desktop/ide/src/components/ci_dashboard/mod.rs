//! # CI/CD Dashboard Component
//!
//! UI component for the CI/CD Pipeline Visualization feature.

mod render_filters;
mod render_active_runs;
mod render_pipelines;
mod render_recent_failures;
mod render_deployment_history;

use crate::types::ci_dashboard::*;
use egui::*;

pub use render_filters::render_filters;
pub use render_active_runs::render_active_runs;
pub use render_pipelines::render_pipelines;
pub use render_recent_failures::render_recent_failures;
pub use render_deployment_history::render_deployment_history;

/// CI/CD dashboard component
pub struct CiDashboardComponent {
    dashboard: CiDashboard,
    selected_pipeline: Option<String>,
    selected_run: Option<String>,
    show_logs: bool,
    show_failures: bool,
}

impl CiDashboardComponent {
    /// Create a new CI dashboard component
    pub fn new() -> Self {
        Self {
            dashboard: CiDashboard {
                pipelines: vec![],
                active_runs: vec![],
                recent_failures: vec![],
                deployment_history: vec![],
                filters: CiFilters {
                    pipeline: None,
                    status: None,
                    environment: None,
                    time_range: None,
                    branch: None,
                },
            },
            selected_pipeline: None,
            selected_run: None,
            show_logs: true,
            show_failures: true,
        }
    }

    /// Set the dashboard data
    pub fn set_dashboard(&mut self, dashboard: CiDashboard) {
        self.dashboard = dashboard;
    }

    /// Render the dashboard
    pub fn render(&mut self, ui: &mut egui::Ui) {
        ui.heading("CI/CD Dashboard");
        ui.separator();

        // Render filters
        render_filters(&self.dashboard.filters, ui);
        ui.separator();

        // Render active runs
        if !self.dashboard.active_runs.is_empty() {
            if let Some(run_id) = render_active_runs(
                &self.dashboard.active_runs,
                &self.selected_run,
                self.show_logs,
                ui,
            ) {
                self.selected_run = Some(run_id);
            }
            ui.separator();
        }

        // Render pipelines
        if !self.dashboard.pipelines.is_empty() {
            if let Some(pipeline_id) = render_pipelines(
                &self.dashboard.pipelines,
                &self.selected_pipeline,
                ui,
            ) {
                self.selected_pipeline = Some(pipeline_id);
            }
            ui.separator();
        }

        // Render recent failures
        if self.show_failures && !self.dashboard.recent_failures.is_empty() {
            render_recent_failures(&self.dashboard.recent_failures, ui);
            ui.separator();
        }

        // Render deployment history
        if !self.dashboard.deployment_history.is_empty() {
            render_deployment_history(&self.dashboard.deployment_history, ui);
        }
    }
}

impl Default for CiDashboardComponent {
    fn default() -> Self {
        Self::new()
    }
}
