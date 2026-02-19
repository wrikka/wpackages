use eframe::egui;
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp;

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        let mut frame = egui::Frame::window(&ctx.style());
        frame.shadow = egui::epaint::Shadow::big_dark();

        egui::Window::new("Window with Shadow")
            .frame(frame)
            .show(ctx, |ui| {
                ui.label("This window has a custom, larger shadow.");
            });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Window Shadow Example");
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Window Shadow", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp)
    })
}
