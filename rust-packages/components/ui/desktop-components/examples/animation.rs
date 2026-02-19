use eframe::egui;
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp {
    angle: f32,
}

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Rotating SVG Animation");
            self.angle += 0.01;
            ui.ctx().request_repaint();

            let desired_size = ui.available_width() * 0.5;
            let (response, painter) =
                ui.allocate_painter(egui::vec2(desired_size, desired_size), egui::Sense::hover());
            let rect = response.rect;

            let rotation = egui::emath::Rot2::from_angle(self.angle);
            let points = vec![
                rect.center() + rotation * egui::vec2(-50.0, -50.0),
                rect.center() + rotation * egui::vec2(50.0, -50.0),
                rect.center() + rotation * egui::vec2(0.0, 50.0),
            ];

            painter.add(egui::Shape::convex_polygon(
                points,
                egui::Color32::from_rgb(86, 108, 255),
                egui::Stroke::new(2.0, egui::Color32::WHITE),
            ));
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Animation", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp::default())
    })
}
