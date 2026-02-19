use eframe::egui;
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp;

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("SVG Example");

            let desired_size = egui::vec2(100.0, 100.0);
            let (rect, _response) = ui.allocate_exact_size(desired_size, egui::Sense::hover());

            // Placeholder for an SVG. egui doesn't have a native SVG renderer.
            // This shape is a simple triangle to demonstrate drawing.
            let points = vec![rect.left_top(), rect.right_top(), rect.center_bottom()];
            let shape = egui::Shape::convex_polygon(
                points,
                egui::Color32::from_rgb(255, 100, 100),
                egui::Stroke::new(2.0, egui::Color32::RED),
            );
            ui.painter().add(shape);
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("SVG", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp)
    })
}
