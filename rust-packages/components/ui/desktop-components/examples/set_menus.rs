use eframe::egui;
use rsui::{button, ButtonVariant, RsuiApp, RsuiTheme};

struct MyApp {
    theme: RguiTheme,
}

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            egui::menu::bar(ui, |ui| {
                ui.menu_button("File", |ui| {
                    if button(ui, "Open", ButtonVariant::Ghost, &self.theme).clicked() { /* ... */ }
                    if button(ui, "Save", ButtonVariant::Ghost, &self.theme).clicked() { /* ... */ }
                    if button(ui, "Exit", ButtonVariant::Ghost, &self.theme).clicked() {
                        ui.ctx().send_viewport_cmd(egui::ViewportCommand::Close);
                    }
                });
                ui.menu_button("Edit", |ui| {
                    if button(ui, "Cut", ButtonVariant::Ghost, &self.theme).clicked() { /* ... */ }
                    if button(ui, "Copy", ButtonVariant::Ghost, &self.theme).clicked() { /* ... */ }
                    if button(ui, "Paste", ButtonVariant::Ghost, &self.theme).clicked() { /* ... */
                    }
                });
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Application Menus Example");
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Set Menus", |cc| {
        let theme = RsuiTheme::default();
        rsui::apply_theme(&cc.egui_ctx, &theme);
        Ok(MyApp { theme })
    })
}
