//! # Render Commit Analyses
//!
//! Render method for review dashboard commit analyses.

use crate::types::review_dashboard_types::*;
use egui::*;

/// Render commit analyses
pub fn render_commit_analyses(commit_analyses: &[CommitAnalysis], ui: &mut egui::Ui) {
    CollapsingHeader::new(format!("Commits ({})", commit_analyses.len()))
        .default_open(true)
        .show(ui, |ui| {
            for commit in commit_analyses {
                CollapsingHeader::new(format!("{}: {}", &commit.commit_hash[..7], commit.message))
                    .show(ui, |ui| {
                        ui.label(format!("Author: {}", commit.author));
                        ui.label(format!(
                            "Timestamp: {}",
                            commit.timestamp.format("%Y-%m-%d %H:%M")
                        ));
                        ui.add_space(5.0);

                        ui.label("Analysis:");
                        ui.label(format!("  Purpose: {}", commit.analysis.purpose));
                        ui.label(format!(
                            "  Impact Areas: {:?}",
                            commit.analysis.impact_areas
                        ));
                        ui.label(format!(
                            "  Breaking Changes: {}",
                            commit.analysis.breaking_changes
                        ));

                        if let Some(coverage) = commit.analysis.test_coverage {
                            ui.label(format!("  Test Coverage: {:.1}%", coverage * 100.0));
                        }
                    });
            }
        });
}
