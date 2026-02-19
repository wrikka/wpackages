//! # Render Filters
//!
//! Render methods for CI dashboard filters.

use crate::types::ci_dashboard::*;
use egui::*;

/// Render filters
pub fn render_filters(filters: &CiFilters, ui: &mut egui::Ui) {
    ui.horizontal(|ui| {
        ui.label("Filters:");

        if let Some(ref pipeline) = filters.pipeline {
            ui.label(format!("Pipeline: {}", pipeline));
        }

        if let Some(ref status) = filters.status {
            ui.label(format!("Status: {:?}", status));
        }

        if let Some(ref environment) = filters.environment {
            ui.label(format!("Environment: {}", environment));
        }
    });
}
