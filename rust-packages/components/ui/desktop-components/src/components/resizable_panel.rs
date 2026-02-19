use crate::types::theme::RsuiTheme;
use eframe::egui;

pub enum PanelSide {
    Left,
    Right,
}

pub fn resizable_panel<R>(
    ctx: &egui::Context,
    theme: &RsuiTheme,
    id: impl std::hash::Hash,
    side: PanelSide,
    default_width: f32,
    add_contents: impl FnOnce(&mut egui::Ui) -> R,
) -> egui::InnerResponse<R> {
    let frame = crate::theme::panel_frame(theme);
    let panel = match side {
        PanelSide::Left => egui::SidePanel::left(egui::Id::new(id)),
        PanelSide::Right => egui::SidePanel::right(egui::Id::new(id)),
    };

    panel
        .resizable(true)
        .default_width(default_width)
        .frame(frame)
        .show(ctx, add_contents)
}
