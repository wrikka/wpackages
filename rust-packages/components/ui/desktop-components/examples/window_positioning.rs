use eframe::egui;
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp;

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        egui::Window::new("Positioned Window")
            .default_pos(egui::pos2(100.0, 100.0))
            .show(ctx, |ui| {
                ui.label("This window starts at a specific position.");
            });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Window Positioning Example");
            ui.label("Main content area.");
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Window Positioning", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp)
    })
}
