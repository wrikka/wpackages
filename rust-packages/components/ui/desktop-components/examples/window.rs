use eframe::egui;
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp {
    show_another_window: bool,
}

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        egui::Window::new("Main Window").show(ctx, |ui| {
            ui.label("This is the main window.");
            ui.checkbox(&mut self.show_another_window, "Show another window");
        });

        if self.show_another_window {
            egui::Window::new("Another Window").show(ctx, |ui| {
                ui.label("This is a separate window.");
            });
        }

        // No CentralPanel, as we are using Windows as the main containers.
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Window Types", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp::default())
    })
}
