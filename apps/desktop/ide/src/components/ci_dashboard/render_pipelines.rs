//! # Render Pipelines
//!
//! Render methods for CI dashboard pipelines.

use crate::components::utils::pipeline_status_icon;
use crate::types::ci_dashboard::*;
use egui::*;

/// Render pipelines
pub fn render_pipelines(
    pipelines: &[Pipeline],
    selected_pipeline: &Option<String>,
    ui: &mut egui::Ui,
) -> Option<String> {
    CollapsingHeader::new(format!("Pipelines ({})", pipelines.len()))
        .default_open(true)
        .show(ui, |ui| {
            for pipeline in pipelines {
                let is_selected = selected_pipeline.as_ref() == Some(&pipeline.id);
                let response = ui.group(|ui| {
                    ui.horizontal(|ui| {
                        // Status icon
                        let icon = pipeline_status_icon(&pipeline.status);
                        ui.label(icon);

                        // Pipeline info
                        ui.label(&pipeline.name);
                        ui.label(&pipeline.repository);

                        // Last run
                        if let Some(last_run) = pipeline.last_run {
                            ui.label(format!("Last: {}", last_run.format("%Y-%m-%d %H:%M")));
                        }

                        ui.with_layout(Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("▶").clicked() {
                                // Trigger pipeline
                            }
                        });
                    });

                    // Stages
                    CollapsingHeader::new("Stages").show(ui, |ui| {
                        for stage in &pipeline.stages {
                            ui.label(format!("  • {}", stage.name));
                        }
                    });
                });

                if response.hovered() && ui.input(|i| i.pointer.any_clicked()) {
                    return Some(pipeline.id.clone());
                }
            }
            None
        })
        .inner
}
