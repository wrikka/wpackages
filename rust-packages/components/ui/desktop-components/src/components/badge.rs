use crate::types::theme::RsuiTheme;
use eframe::egui;

pub fn badge(ui: &mut egui::Ui, text: impl Into<String>, theme: &RsuiTheme) -> egui::Response {
    ui.label(egui::RichText::new(text).color(theme.primary_foreground))
        .on_hover_cursor(egui::CursorIcon::Default)
        .on_hover_ui_at_pointer(|ui| {
            ui.label("Badge");
        })
}
