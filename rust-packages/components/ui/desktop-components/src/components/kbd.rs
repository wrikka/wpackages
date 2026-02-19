use crate::types::theme::RsuiTheme;
use eframe::egui;

pub fn kbd(ui: &mut egui::Ui, theme: &RsuiTheme, text: &str) {
    egui::Frame::new()
        .fill(theme.secondary)
        .stroke(egui::Stroke::new(1.0, theme.border))
        .inner_margin(egui::Margin::symmetric(6, 4))
        .corner_radius(theme.radius / 2.0)
        .show(ui, |ui| {
            ui.label(egui::RichText::new(text).monospace());
        });
}
