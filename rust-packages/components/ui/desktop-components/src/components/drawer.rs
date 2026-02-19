use crate::types::theme::RsuiTheme;
use eframe::egui;

pub fn drawer<R>(
    ctx: &egui::Context,
    theme: &RsuiTheme,
    id: impl std::hash::Hash,
    open: &mut bool,
    add_contents: impl FnOnce(&mut egui::Ui) -> R,
) -> Option<egui::InnerResponse<R>> {
    if !*open {
        return None;
    }

    let frame = crate::theme::panel_frame(theme);
    let response = egui::SidePanel::left(egui::Id::new(id))
        .frame(frame)
        .show(ctx, add_contents);

    // A simple way to handle closing the drawer by clicking outside
    if ctx.input(|i| i.pointer.primary_clicked() && !response.response.hovered()) {
        *open = false;
    }

    Some(response)
}
