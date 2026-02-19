use crate::context::RsuiContext;
use eframe::egui;

pub fn modal<R>(
    egui_ctx: &egui::Context,
    rsui_ctx: &RsuiContext,
    title: &str,
    open: &mut bool,
    add_contents: impl FnOnce(&mut egui::Ui) -> R,
) -> Option<egui::InnerResponse<R>> {
    if !*open {
        return None;
    }

    let theme = &rsui_ctx.theme;
    let mut window_frame = crate::theme::panel_frame(theme);
    window_frame.shadow = egui::epaint::Shadow::NONE;

    let response = egui::Window::new(title)
        .open(open)
        .collapsible(false)
        .resizable(true)
        .frame(window_frame)
        .title_bar(true)
        .show(egui_ctx, |ui| {
            ui.add_space(theme.radius / 2.0);
            ui.separator();
            ui.add_space(theme.radius);
            add_contents(ui)
        });

    response.and_then(|inner| {
        inner
            .inner
            .map(|r| egui::InnerResponse::new(r, inner.response))
    })
}
