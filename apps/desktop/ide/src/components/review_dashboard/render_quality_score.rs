//! # Render Quality Score
//!
//! Render method for review dashboard quality score.

use crate::types::review_dashboard_types::*;
use egui::*;

/// Render quality score
pub fn render_quality_score(score: &QualityScore, ui: &mut egui::Ui) {
    CollapsingHeader::new("Quality Score")
        .default_open(true)
        .show(ui, |ui| {
            ui.horizontal(|ui| {
                ui.label("Overall Score:");
                ui.add_space(10.0);
                let color = if score.overall >= 0.8 {
                    Color32::GREEN
                } else if score.overall >= 0.6 {
                    Color32::YELLOW
                } else {
                    Color32::RED
                };
                ui.colored_label(color, format!("{:.1}", score.overall * 100.0));
            });

            ui.separator();

            ui.label("Metrics:");
            ui.label(format!("  Maintainability: {:.1}", score.maintainability * 100.0));
            ui.label(format!("  Test Coverage: {:.1}", score.test_coverage * 100.0));
            ui.label(format!("  Documentation: {:.1}", score.documentation * 100.0));
            ui.label(format!("  Complexity: {:.1}", score.complexity * 100.0));
            ui.label(format!("  Security: {:.1}", score.security * 100.0));
        });
}
