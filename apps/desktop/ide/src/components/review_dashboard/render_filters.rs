//! # Render Filters
//!
//! Render method for review dashboard filters.

use crate::types::review_dashboard_types::*;
use egui::*;

/// Render filters
pub fn render_filters(filters: &ReviewFilters, ui: &mut egui::Ui) {
    ui.horizontal(|ui| {
        ui.label("Filters:");
        ui.add_space(10.0);

        if let Some(ref author) = filters.author {
            ui.label(format!("Author: {}", author));
        }

        if let Some(ref severity) = filters.severity {
            ui.label(format!("Severity: {:?}", severity));
        }

        if let Some(ref pattern) = filters.file_pattern {
            ui.label(format!("Pattern: {}", pattern));
        }
    });
}
