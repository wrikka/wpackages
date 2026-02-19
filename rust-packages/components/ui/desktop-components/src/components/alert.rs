use crate::{context::RsuiContext, types::alert::AlertKind};
use eframe::egui;

pub fn alert(
    ui: &mut egui::Ui,
    ctx: &RsuiContext,
    kind: AlertKind,
    title: &str,
    description: &str,
) {
    let theme = &ctx.theme;
    let (icon, color) = match kind {
        AlertKind::Info => (egui_phosphor::regular::INFO, theme.primary),
        AlertKind::Success => (egui_phosphor::regular::CHECK_CIRCLE, theme.primary),
        AlertKind::Warning => (egui_phosphor::regular::WARNING, theme.accent),
        AlertKind::Error => (egui_phosphor::regular::X_CIRCLE, theme.destructive),
    };

    egui::Frame::new()
        .fill(theme.card)
        .stroke(egui::Stroke::new(1.0, color))
        .inner_margin(egui::Margin::same(10))
        .corner_radius(theme.radius)
        .show(ui, |ui| {
            ui.horizontal(|ui| {
                ui.colored_label(
                    color,
                    egui::RichText::new(icon.to_string()).font(egui::FontId::proportional(20.0)),
                );
                ui.vertical(|ui| {
                    ui.strong(title);
                    ui.label(description);
                });
            });
        });
}
