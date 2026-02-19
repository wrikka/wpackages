//! # Render PR Summary
//!
//! Render method for review dashboard PR summary.

use crate::types::review_dashboard_types::*;
use egui::*;

/// Render PR summary
pub fn render_pr_summary(summary: &PrSummary, ui: &mut egui::Ui) {
    CollapsingHeader::new(format!("PR #{}: {}", summary.pr_number, summary.title))
        .default_open(true)
        .show(ui, |ui| {
            ui.label(format!("Author: {}", summary.author));
            ui.label(format!("Status: {:?}", summary.status));
            ui.label(format!("Created: {}", summary.created_at.format("%Y-%m-%d %H:%M")));

            ui.separator();

            // AI Insights
            CollapsingHeader::new("AI Insights")
                .default_open(true)
                .show(ui, |ui| {
                    ui.label(&summary.ai_insights.summary);
                    ui.add_space(5.0);

                    if !summary.ai_insights.key_changes.is_empty() {
                        ui.label("Key Changes:");
                        for change in &summary.ai_insights.key_changes {
                            ui.label(format!("  • {}", change));
                        }
                    }

                    if !summary.ai_insights.potential_issues.is_empty() {
                        ui.add_space(5.0);
                        ui.label("Potential Issues:");
                        for issue in &summary.ai_insights.potential_issues {
                            ui.colored_label(
                                match issue.severity {
                                    IssueSeverity::Critical => Color32::RED,
                                    IssueSeverity::High => Color32::LIGHT_RED,
                                    IssueSeverity::Medium => Color32::YELLOW,
                                    IssueSeverity::Low => Color32::GRAY,
                                },
                                format!(
                                    "  • [{}] {}",
                                    match issue.severity {
                                        IssueSeverity::Critical => "CRITICAL",
                                        IssueSeverity::High => "HIGH",
                                        IssueSeverity::Medium => "MEDIUM",
                                        IssueSeverity::Low => "LOW",
                                    },
                                    issue.description
                                ),
                            );
                        }
                    }

                    ui.label(format!("Complexity Score: {:.2}", summary.ai_insights.complexity_score));
                    ui.label(format!("Risk Level: {:?}", summary.ai_insights.risk_level));
                });

            // File Changes
            if !summary.files_changed.is_empty() {
                CollapsingHeader::new("File Changes").show(ui, |ui| {
                    for file in &summary.files_changed {
                        ui.label(
                            format!(
                                "{}: +{} -{} ({:?})",
                                file.path, file.additions, file.deletions, file.change_type
                            ),
                        );
                    }
                });
            }
        });
}
