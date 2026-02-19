use crate::app::state::refactoring_preview::{RefactoringPreviewState, RiskLevel};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_refactoring_preview_panel(
    ctx: &Context,
    state: &mut RefactoringPreviewState,
) {
    egui::Window::new("🔧 Refactoring Preview")
        .collapsible(true)
        .resizable(true)
        .default_width(800.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.show_diff, "Show Diff");
                ui.checkbox(&mut state.auto_apply_safe, "Auto-apply Safe");
            });

            ui.separator();

            ui.heading("Refactoring Previews");
            ScrollArea::vertical()
                .max_height(300.0)
                .show(ui, |ui| {
                    for (i, preview) in state.previews.iter().enumerate() {
                        let is_selected = state.current_preview == Some(i);
                        let risk_color = match preview.risk_level {
                            RiskLevel::Safe => Color32::LIGHT_GREEN,
                            RiskLevel::Low => Color32::LIGHT_BLUE,
                            RiskLevel::Medium => Color32::YELLOW,
                            RiskLevel::High => Color32::RED,
                        };

                        ui.group(|ui| {
                            ui.horizontal(|ui| {
                                if is_selected {
                                    ui.radio(true, "");
                                } else {
                                    ui.radio(false, "");
                                }

                                ui.label(&preview.name);
                                ui.colored_label(risk_color, format!("{:?}", preview.risk_level));
                            });

                            ui.label(&preview.description);

                            ui.horizontal(|ui| {
                                if ui.button("👁️ Preview").clicked() {
                                    state.select_preview(i);
                                }
                                if ui.button("✅ Apply").clicked() {
                                    state.apply_preview(i);
                                }
                                if ui.button("🗑️ Discard").clicked() {
                                    state.discard_preview(i);
                                }
                            });
                        });
                    }
                });

            if state.previews.is_empty() {
                ui.label("No refactoring previews. Run refactoring operations to see previews.");
            }

            ui.separator();

            if let Some(preview) = state.get_current() {
                ui.heading(format!("Preview: {}", preview.name));
                ui.label(&preview.description);

                ui.separator();

                ui.heading("Changes");
                for change in &preview.changes {
                    ui.group(|ui| {
                        ui.horizontal(|ui| {
                            ui.label(&change.file_path);
                            ui.label(format!("Lines {}-{}", change.line_range.0, change.line_range.1));
                        });

                        ui.label(format!("{:?}", change.change_type));
                        ui.code(&change.content);
                    });
                }
            }
        });
}
