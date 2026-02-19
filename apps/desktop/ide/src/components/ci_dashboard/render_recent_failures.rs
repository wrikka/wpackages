//! # Render Recent Failures
//!
//! Render methods for CI dashboard recent failures.

use crate::components::utils::failure_type_icon;
use crate::types::ci_dashboard::*;
use egui::*;

/// Render recent failures
pub fn render_recent_failures(recent_failures: &[PipelineFailure], ui: &mut egui::Ui) {
    CollapsingHeader::new(format!("Recent Failures ({})", recent_failures.len()))
        .default_open(true)
        .show(ui, |ui| {
            for failure in recent_failures {
                ui.group(|ui| {
                    ui.horizontal(|ui| {
                        // Failure type icon
                        let icon = failure_type_icon(&failure.failure_type);
                        ui.label(icon);

                        // Failure info
                        ui.label(&failure.pipeline_name);
                        ui.label(format!("Run: {}", failure.run_id));

                        ui.with_layout(Layout::right_to_left(egui::Align::Center), |ui| {
                            if ui.button("Retry").clicked() {
                                // Retry run
                            }
                        });
                    });

                    // Root cause
                    ui.label(format!("Root Cause: {}", failure.root_cause));

                    // Affected jobs
                    if !failure.affected_jobs.is_empty() {
                        ui.label("Affected Jobs:");
                        for job in &failure.affected_jobs {
                            ui.label(format!("  • {}", job));
                        }
                    }

                    // Suggested fixes
                    if !failure.suggested_fixes.is_empty() {
                        ui.label("Suggested Fixes:");
                        for fix in &failure.suggested_fixes {
                            ui.label(format!("  • {}", fix));
                        }
                    }

                    // AI insights
                    if let Some(ref insights) = failure.ai_insights {
                        CollapsingHeader::new("AI Insights").show(ui, |ui| {
                            ui.label(&insights.summary);
                            ui.label(format!("Likely Cause: {}", insights.likely_cause));
                            ui.label(format!("Confidence: {:.1}%", insights.confidence * 100.0));

                            if !insights.recommended_actions.is_empty() {
                                ui.label("Recommended Actions:");
                                for action in &insights.recommended_actions {
                                    ui.label(format!("  • {}", action));
                                }
                            }
                        });
                    }
                });
            }
        });
}
