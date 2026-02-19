use crate::app::state::documentation_mode::DocumentationModeState;
use egui::{Context, Ui};

pub fn render_documentation_mode_panel(
    ctx: &Context,
    state: &mut DocumentationModeState,
) {
    egui::Window::new("📖 Documentation Mode")
        .collapsible(true)
        .resizable(true)
        .default_width(400.0)
        .show(ctx, |ui| {
            ui.label("Documentation Mode Settings");

            ui.separator();

            ui.checkbox(&mut state.show_line_numbers, "Show Line Numbers");
            ui.checkbox(&mut state.show_status_bar, "Show Status Bar");
            ui.checkbox(&mut state.show_side_panels, "Show Side Panels");
            ui.checkbox(&mut state.show_minimap, "Show Minimap");
            ui.checkbox(&mut state.show_breadcrumbs, "Show Breadcrumbs");
            ui.checkbox(&mut state.show_inline_blame, "Show Inline Blame");

            ui.separator();

            ui.horizontal(|ui| {
                ui.label("Font Size:");
                ui.add(egui::Slider::new(&mut state.font_size, 10..=24));
            });

            ui.horizontal(|ui| {
                ui.label("Line Height:");
                ui.add(egui::Slider::new(&mut state.line_height, 1.0..=2.5));
            });

            ui.separator();

            ui.horizontal(|ui| {
                ui.label("Status:");
                if state.is_active {
                    ui.colored_label(egui::Color32::LIGHT_GREEN, "✓ Active");
                } else {
                    ui.label("Inactive");
                }
            });

            ui.separator();

            ui.horizontal(|ui| {
                if ui.button("📖 Activate").clicked() {
                    state.activate();
                }
                if ui.button("🚫 Deactivate").clicked() {
                    state.deactivate();
                }
                if ui.button("🔄 Toggle").clicked() {
                    state.toggle();
                }
            });
        });
}
