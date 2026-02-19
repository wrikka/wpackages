use crate::app::state::IdeState;

pub(crate) fn render_comparison_results(ui: &mut egui::Ui, state: &mut IdeState, comparison: &crate::types::commit_comparison::ComparisonResult) {
    ui.heading("Comparison Summary");
    ui.separator();

    ui.columns(4, |cols| {
        cols[0].heading("Files");
        cols[0].label(format!("Total: {}", comparison.stats.total_files));
        cols[0].label(format!("Added: {}", comparison.stats.added_files));
        cols[0].label(format!("Modified: {}", comparison.stats.modified_files));
        cols[0].label(format!("Deleted: {}", comparison.stats.deleted_files));

        cols[1].heading("Changes");
        cols[1].label(format!("Additions: +{}", comparison.stats.total_additions));
        cols[1].label(format!("Deletions: -{}", comparison.stats.total_deletions));
        cols[1].label(format!("Net: {}", comparison.stats.total_additions as i64 - comparison.stats.total_deletions as i64));

        cols[2].heading("View Mode");
        if state.commit_comparison.show_side_by_side {
            cols[2].label("Side by Side");
        }
        if state.commit_comparison.show_unified {
            cols[2].label("Unified");
        }

        cols[3].heading("Actions");
        if cols[3].button("Export Diff").clicked() {
            if let Err(e) = super::export::export_diff_to_file(comparison) {
                state.set_error(format!("Failed to export diff: {}", e));
            }
        }
    });

    ui.separator();
    ui.heading("Files");

    egui::ScrollArea::vertical()
        .id_salt("comparison_files")
        .max_height(400.0)
        .show(ui, |ui| {
            for file in &comparison.files {
                render_file_comparison(ui, state, file);
                ui.add_space(8.0);
            }
        });
}

fn render_file_comparison(ui: &mut egui::Ui, state: &mut IdeState, file: &crate::types::commit_comparison::FileComparison) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(&file.path);
            render_file_status_badge(ui, file.status);

            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                ui.label(format!("+{} -{}", file.additions, file.deletions));
            });
        });

        if ui.button("View Diff").clicked() {
            state.diff_navigation.selected_file = Some(file.path.clone());
        }
    });
}

fn render_file_status_badge(ui: &mut egui::Ui, status: crate::types::commit_comparison::FileStatus) {
    let (text, color) = match status {
        crate::types::commit_comparison::FileStatus::Added => ("ADDED", egui::Color32::GREEN),
        crate::types::commit_comparison::FileStatus::Modified => ("MODIFIED", egui::Color32::from_rgb(59, 130, 246)),
        crate::types::commit_comparison::FileStatus::Deleted => ("DELETED", egui::Color32::RED),
        crate::types::commit_comparison::FileStatus::Renamed => ("RENAMED", egui::Color32::from_rgb(251, 191, 36)),
        crate::types::commit_comparison::FileStatus::Copied => ("COPIED", egui::Color32::from_rgb(156, 163, 175)),
    };

    ui.colored_label(color, text);
}
