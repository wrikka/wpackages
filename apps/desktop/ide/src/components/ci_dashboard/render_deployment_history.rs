//! # Render Deployment History
//!
//! Render methods for CI dashboard deployment history.

use crate::components::utils::deployment_status_icon;
use crate::types::ci_dashboard::*;
use egui::*;

/// Render deployment history
pub fn render_deployment_history(deployment_history: &[Deployment], ui: &mut egui::Ui) {
    CollapsingHeader::new(format!("Deployment History ({})", deployment_history.len()))
        .default_open(true)
        .show(ui, |ui| {
            for deployment in deployment_history {
                ui.group(|ui| {
                    ui.horizontal(|ui| {
                        // Status icon
                        let icon = deployment_status_icon(&deployment.status);
                        ui.label(icon);

                        // Deployment info
                        ui.label(&deployment.environment);
                        ui.label(&deployment.version);
                        ui.label(format!("By: {}", deployment.deployed_by));
                        ui.label(format!("At: {}", deployment.deployed_at.format("%Y-%m-%d %H:%M")));

                        // Rollback info
                        if let Some(ref rollback) = deployment.rollback_info {
                            ui.label(format!("Rolled back from: {}", rollback.previous_version));
                        }
                    });
                });
            }
        });
}
