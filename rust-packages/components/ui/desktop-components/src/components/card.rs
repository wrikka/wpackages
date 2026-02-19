use crate::context::RsuiContext;
use eframe::egui;

pub fn card<R>(
    ui: &mut egui::Ui,
    ctx: &RsuiContext,
    add_contents: impl FnOnce(&mut egui::Ui) -> R,
) -> egui::InnerResponse<R> {
    crate::theme::panel_frame(&ctx.theme).show(ui, add_contents)
}
