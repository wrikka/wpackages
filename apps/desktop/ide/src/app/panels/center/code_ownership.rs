use crate::app::state::code_ownership::CodeOwnershipState;
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_code_ownership_panel(
    ctx: &Context,
    state: &mut CodeOwnershipState,
) {
    egui::Window::new("👥 Code Ownership")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.show_dashboard, "Show Dashboard");
                ui.checkbox(&mut state.group_by_team, "Group by Team");
            });

            ui.separator();

            if ui.button("🔄 Calculate Stats").clicked() {
                state.calculate_stats();
            }

            ui.separator();

            ui.heading("Ownership Statistics");
            ScrollArea::vertical()
                .max_height(300.0)
                .show(ui, |ui| {
                    for stat in &state.ownership_stats {
                        ui.group(|ui| {
                            ui.horizontal(|ui| {
                                ui.label(&stat.owner);
                                ui.label(format!("{} files", stat.file_count));
                                ui.label(format!("{} lines", stat.line_count));
                                ui.colored_label(Color32::LIGHT_BLUE, format!("{:.1}%", stat.percentage));
                            });

                            ui.add(egui::ProgressBar::new(stat.percentage / 100.0).show_text());
                        });
                    }
                });

            ui.separator();

            ui.heading("Top Owners");
            let top_owners = state.get_top_owners(5);
            for (i, owner) in top_owners.iter().enumerate() {
                ui.label(format!("{}. {} - {:.1}%", i + 1, owner.owner, owner.percentage));
            }

            ui.separator();

            ui.heading("File Ownerships");
            ScrollArea::vertical()
                .max_height(200.0)
                .show(ui, |ui| {
                    for (file_path, ownership) in &state.file_ownership {
                        ui.group(|ui| {
                            ui.label(&file_path);

                            for owner in &ownership.owners {
                                ui.label(format!("  - {}", owner.name));
                            }
                        });
                    }
                });
        });
}
