use crate::context::RsuiContext;
use eframe::egui;

pub fn pill(ui: &mut egui::Ui, ctx: &RsuiContext, text: &str) {
    let theme = &ctx.theme;
    let bg = theme.secondary;
    let fg = theme.secondary_foreground;

    egui::Frame::NONE
        .fill(bg)
        .inner_margin(egui::Margin::symmetric(10, 6))
        .corner_radius(egui::CornerRadius::same(255))
        .show(ui, |ui| {
            ui.label(egui::RichText::new(text).color(fg).small());
        });
}
