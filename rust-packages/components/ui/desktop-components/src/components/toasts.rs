use crate::{
    context::RsuiContext,
    types::toasts::{ToastKind, Toasts},
};
use eframe::egui;
use std::time::Instant;

pub fn toasts(egui_ctx: &egui::Context, rsui_ctx: &RsuiContext, toasts: &mut Toasts) {
    let theme = &rsui_ctx.theme;
    let now = Instant::now();
    toasts
        .get_mut()
        .retain(|toast| now.duration_since(toast.created_at) < toast.duration);

    egui::Area::new("toasts_area".into())
        .anchor(egui::Align2::RIGHT_TOP, egui::vec2(-10.0, 10.0))
        .show(egui_ctx, |ui| {
            for toast in toasts.get_mut().iter() {
                let (icon, color) = match toast.kind {
                    ToastKind::Info => (egui_phosphor::regular::INFO, theme.primary),
                    ToastKind::Success => (egui_phosphor::regular::CHECK_CIRCLE, theme.primary),
                    ToastKind::Warning => (egui_phosphor::regular::WARNING, theme.accent),
                    ToastKind::Error => (egui_phosphor::regular::X_CIRCLE, theme.destructive),
                };

                egui::Frame::default()
                    .fill(theme.card)
                    .stroke(egui::Stroke::new(1.0, theme.border))
                    .inner_margin(egui::Margin::same(10))
                    .corner_radius(theme.radius)
                    .show(ui, |ui| {
                        ui.horizontal(|ui| {
                            ui.colored_label(
                                color,
                                egui::RichText::new(icon.to_string())
                                    .font(egui::FontId::proportional(20.0)),
                            );
                            ui.label(&toast.content);
                        });
                    });
                ui.add_space(5.0);
            }
        });
}
