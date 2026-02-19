use crate::context::RsuiContext;

pub trait RsuiApp {
    fn on_start(&mut self, _ctx: &RsuiContext) {}

    fn update(&mut self, egui_ctx: &eframe::egui::Context, rsui_ctx: &mut RsuiContext);
}
