use eframe::{egui, emath::lerp};
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp {
    opacity: f32,
}

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        let mut visuals = (*ctx.style()).clone().visuals;
        self.opacity =
            ctx.animate_bool_with_time(egui::Id::new("opacity_anim"), self.opacity > 0.5, 0.5);
        visuals.window_fill = visuals
            .window_fill
            .linear_multiply(lerp(0.5..=1.0, self.opacity));
        ctx.set_visuals(visuals);

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Opacity Example");
            if ui.button("Toggle Opacity").clicked() {
                self.opacity = if self.opacity > 0.5 { 0.0 } else { 1.0 };
            }
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Opacity", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp::default())
    })
}
