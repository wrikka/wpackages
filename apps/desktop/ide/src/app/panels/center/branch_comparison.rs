use crate::app::state::branch_comparison::{BranchComparisonState, MergeStatus};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_branch_comparison_panel(
    ctx: &Context,
    state: &mut BranchComparisonState,
) {
    egui::Window::new("🔀 Branch Comparison")
        .collapsible(true)
        .resizable(true)
        .default_width(700.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.auto_refresh, "Auto-refresh");
                ui.checkbox(&mut state.show_conflicts_only, "Show Conflicts Only");
            });

            ui.separator();

            ui.horizontal(|ui| {
                ui.label("Base Branch:");
                let mut base = String::new();
                ui.text_edit_singleline(&mut base);

                ui.label("Compare Branch:");
                let mut compare = String::new();
                ui.text_edit_singleline(&mut compare);

                if ui.button("🔄 Compare").clicked() {
                    state.refresh_comparison(base, compare);
                }
            });

            ui.separator();

            ui.heading("Branch Comparisons");
            ScrollArea::vertical()
                .max_height(400.0)
                .show(ui, |ui| {
                    for (i, comparison) in state.comparisons.iter().enumerate() {
                        render_comparison(ui, comparison, i, state);
                    }
                });

            if state.comparisons.is_empty() {
                ui.label("No comparisons. Select branches to compare.");
            }
        });
}

fn render_comparison(
    ui: &mut Ui,
    comparison: &crate::app::state::branch_comparison::BranchComparison,
    index: usize,
    state: &BranchComparisonState,
) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(format!("{} → {}", comparison.base_branch, comparison.compare_branch));

            let status_icon = match comparison.merge_status {
                MergeStatus::Clean => "✅",
                MergeStatus::Conflicts => "⚡",
                MergeStatus::NotFastForward => "🔄",
            };

            ui.label(status_icon);

            ui.label(format!("Ahead: {}", comparison.ahead_by));
            ui.label(format!("Behind: {}", comparison.behind_by));
        });

        if comparison.conflict_prediction.has_conflicts {
            ui.separator();
            ui.colored_label(Color32::RED, "⚠️ Potential Conflicts Detected");

            for conflict in &comparison.conflict_prediction.conflict_files {
                ui.horizontal(|ui| {
                    let risk_color = match conflict.risk_level {
                        crate::app::state::branch_comparison::RiskLevel::Low => Color32::LIGHT_BLUE,
                        crate::app::state::branch_comparison::RiskLevel::Medium => Color32::YELLOW,
                        crate::app::state::branch_comparison::RiskLevel::High => Color32::RED,
                    };

                    ui.colored_label(risk_color, format!("{:?}", conflict.risk_level));
                    ui.label(&conflict.path);
                    ui.label(format!("{:?}", conflict.conflict_type));
                });
            }

            ui.label(format!("Confidence: {:.0}%", comparison.conflict_prediction.confidence * 100.0));
        }

        ui.separator();

        ui.horizontal(|ui| {
            if ui.button("🔍 View Details").clicked() {
                state.select_comparison(index);
            }
            if ui.button("🔄 Refresh").clicked() {
                state.refresh_comparison(
                    comparison.base_branch.clone(),
                    comparison.compare_branch.clone()
                );
            }
        });
    });
}
