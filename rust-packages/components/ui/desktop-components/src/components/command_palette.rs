use crate::{types::theme::RsuiTheme, components::text_input};
use eframe::egui;

pub trait Command {
    fn name(&self) -> &str;
    fn run(&mut self, ui: &mut egui::Ui);
}

pub fn command_palette(
    ctx: &egui::Context,
    theme: &RsuiTheme,
    open: &mut bool,
    search: &mut String,
    commands: &mut [Box<dyn Command>],
) {
    let mut close_on_click = false;
    let search_lower = search.to_lowercase();
    egui::Window::new("Command Palette")
        .open(open)
        .collapsible(false)
        .resizable(false)
        .frame(crate::theme::panel_frame(theme))
        .title_bar(false)
        .anchor(egui::Align2::CENTER_TOP, [0.0, 100.0])
        .show(ctx, |ui| {
            text_input(ui, search, "Search commands...");
            ui.separator();
            egui::ScrollArea::vertical().show(ui, |ui| {
                for command in commands.iter_mut() {
                    let matches = command.name().to_lowercase().contains(&search_lower);
                    if matches && ui.button(command.name()).clicked() {
                        command.run(ui);
                        close_on_click = true;
                    }
                }
            });
        });

    if close_on_click {
        *open = false;
    }
}
