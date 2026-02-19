use crate::app::state::IdeState;
use crate::types::ci_cd::{CiStatus, PipelineStatus, StageStatus};

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("CI/CD Status");
    ui.separator();

    ui.horizontal(|ui| {
        if ui.button("Refresh").clicked() {
            refresh_ci_status(state);
        }

        ui.checkbox(&mut state.ci_cd.auto_refresh, "Auto Refresh");
        
        if state.ci_cd.auto_refresh {
            ui.label(format!("Every {}s", state.ci_cd.refresh_interval_seconds));
        }

        ui.checkbox(&mut state.ci_cd.show_only_active, "Show Only Active");

        if state.ci_cd.loading {
            ui.add(egui::Spinner::new());
        }
    });

    ui.separator();

    if let Some(last_refresh) = &state.ci_cd.last_refresh {
        ui.label(format!("Last refresh: {}", last_refresh.format("%H:%M:%S")));
    }

    ui.separator();

    let statuses: Vec<_> = state
        .ci_cd
        .statuses
        .iter()
        .filter(|s| !state.ci_cd.show_only_active || s.status.is_active())
        .collect();

    egui::ScrollArea::vertical()
        .id_salt("ci_cd_status")
        .max_height(500.0)
        .show(ui, |ui| {
            for status in &statuses {
                render_pipeline_status(ui, state, status);
                ui.add_space(8.0);
            }
        });
}

fn render_pipeline_status(ui: &mut egui::Ui, state: &mut IdeState, status: &CiStatus) {
    let selected = state.ci_cd.selected_pipeline.as_ref() == Some(&status.pipeline_id);

    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.selectable_label(selected, &status.pipeline_name);
            
            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                render_status_badge(ui, status.status);
                ui.label(&status.provider);
            });
        });

        ui.horizontal(|ui| {
            ui.label(format!("Commit: {}", &status.commit_id[..7.min(status.commit_id.len())]));
            ui.label(format!("Branch: {}", status.branch));
            ui.label(format!("Author: {}", status.author));
        });

        if let Some(duration) = status.duration_seconds {
            ui.label(format!("Duration: {}s", duration));
        }

        if ui.button("View Details").clicked() {
            state.ci_cd.selected_pipeline = Some(status.pipeline_id.clone());
        }

        if ui.button("Open in Browser").clicked() {
            if let Err(e) = open::that(&status.url) {
                eprintln!("Failed to open URL: {}", e);
            }
        }
    });

    if selected && !status.stages.is_empty() {
        ui.indent(|ui| {
            ui.heading("Stages");
            for stage in &status.stages {
                render_stage_status(ui, stage);
            }
        });
    }
}

fn render_stage_status(ui: &mut egui::Ui, stage: &StageStatus) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(&stage.name);
            render_status_badge(ui, stage.status);
            
            if let Some(duration) = stage.duration_seconds {
                ui.label(format!("{}s", duration));
            }
        });

        if !stage.jobs.is_empty() {
            ui.indent(|ui| {
                for job in &stage.jobs {
                    ui.horizontal(|ui| {
                        ui.label(&job.name);
                        render_status_badge(ui, job.status);
                        
                        if ui.small_button("Logs").clicked() {
                            if let Some(logs_url) = &job.logs_url {
                                if let Err(e) = open::that(logs_url) {
                                    eprintln!("Failed to open logs: {}", e);
                                }
                            }
                        }
                    });
                }
            });
        }
    });
}

fn render_status_badge(ui: &mut egui::Ui, status: PipelineStatus) {
    let (text, color) = match status {
        PipelineStatus::Pending => ("PENDING", egui::Color32::GRAY),
        PipelineStatus::Running => ("RUNNING", egui::Color32::from_rgb(59, 130, 246)),
        PipelineStatus::Success => ("SUCCESS", egui::Color32::GREEN),
        PipelineStatus::Failed => ("FAILED", egui::Color32::RED),
        PipelineStatus::Cancelled => ("CANCELLED", egui::Color32::from_rgb(156, 163, 175)),
        PipelineStatus::Skipped => ("SKIPPED", egui::Color32::from_rgb(156, 163, 175)),
        PipelineStatus::Unknown => ("UNKNOWN", egui::Color32::GRAY),
    };

    ui.colored_label(color, text);
}

fn refresh_ci_status(state: &mut IdeState) {
    state.ci_cd.loading = true;
    state.ci_cd.last_refresh = Some(chrono::Utc::now());

    // TODO: Implement CI/CD status fetching
    // - Integrate with GitHub Actions, GitLab CI, Jenkins, etc.
    // - Fetch pipeline status, runs, and failures
    // - Update state with CI/CD data
    // For now, this is a placeholder that would be replaced with actual implementation
    
    state.ci_cd.loading = false;
}
