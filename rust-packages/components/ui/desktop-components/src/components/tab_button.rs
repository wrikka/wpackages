use crate::context::RsuiContext;
use eframe::egui;

pub fn tab_button(
    ui: &mut egui::Ui,
    ctx: &RsuiContext,
    title: &str,
    selected: bool,
) -> egui::Response {
    let theme = &ctx.theme;
    let fg = if selected {
        theme.primary
    } else {
        theme.foreground
    };

    ui.add(
        egui::Button::new(egui::RichText::new(title).monospace().color(fg))
            .selected(selected)
            .fill(egui::Color32::TRANSPARENT)
            .stroke(egui::Stroke::NONE)
            .corner_radius(theme.radius),
    )
}
