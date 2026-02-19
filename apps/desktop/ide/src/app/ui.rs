use super::app::IdeApp;
use crate::app::panels;

use desktop_components::prelude::RsuiContext;
use desktop_components::RsuiApp;

impl RsuiApp for IdeApp {
    fn update(&mut self, ctx: &egui::Context, _rsui_ctx: &mut RsuiContext) {
        super::styling::apply_ui_config(ctx, &self.state.settings.config);

        super::input::handle_global_shortcuts(ctx, &mut self.state);

        super::rendering::render_main_ui(ctx, &mut self.state);

        super::palette::handle_command_palette(ctx, &mut self.state);

        panels::modal::render(ctx, &mut self.state);
    }
}
