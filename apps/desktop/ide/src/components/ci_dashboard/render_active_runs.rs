//! # Render Active Runs
//!
//! Render methods for CI dashboard active runs.

use crate::components::utils::run_status_icon;
use crate::types::ci_dashboard::*;
use egui::*;

/// Render active runs
pub fn render_active_runs(
    active_runs: &[PipelineRun],
    selected_run: &Option<String>,
    show_logs: bool,
    ui: &mut egui::Ui,
) -> Option<String> {
    CollapsingHeader::new(format!("Active Runs ({})", active_runs.len()))
        .default_open(true)
        .show(ui, |ui| {
            for run in active_runs {
                let is_selected = selected_run.as_ref() == Some(&run.id);
                let response = ui.group(|ui| {
                    ui.horizontal(|ui| {
                        // Status icon
                        let icon = run_status_icon(&run.status);
                        ui.label(icon);

                        // Run info
                        ui.label(format!("#{}", run.run_number));
                        ui.label(&run.pipeline_id);

                        // Duration
                        if let Some(duration) = run.duration_seconds {
                            ui.label(format!("{}s", duration));
                        }

                        // Commit info
                        ui.label(format!("{}: {}", &run.commit.hash[..7], run.commit.message));

                        ui.with_layout(Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("Cancel").clicked() {
                                // Cancel run
                            }
                        });
                    });

                    // Progress bar for running jobs
                    if run.status == RunStatus::Running {
                        let progress = calculate_progress(run);
                        ui.add(ProgressBar::new(progress).show_percentage());
                    }
                });

                if response.hovered() && ui.input(|i| i.pointer.any_clicked()) {
                    return Some(run.id.clone());
                }
            }
            None
        })
        .inner
}

/// Calculate progress for a run
fn calculate_progress(run: &PipelineRun) -> f32 {
    let total_jobs: usize = run.stage_runs.iter().map(|s| s.job_runs.len()).sum();
    let completed_jobs: usize = run
        .stage_runs
        .iter()
        .flat_map(|s| s.job_runs.iter())
        .filter(|j| j.status == RunStatus::Success || j.status == RunStatus::Failed)
        .count();

    if total_jobs > 0 {
        completed_jobs as f32 / total_jobs as f32
    } else {
        0.0
    }
}
