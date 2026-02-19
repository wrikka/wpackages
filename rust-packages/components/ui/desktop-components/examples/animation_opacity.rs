use std::f32::consts::TAU;
use std::time::Instant;

use rgui::RguiApp;

#[derive(Default)]
struct App {
    start: Option<Instant>,
    speed: f32,
    alpha: f32,
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        let start = *self.start.get_or_insert_with(Instant::now);
        let t = start.elapsed().as_secs_f32();

        egui::TopBottomPanel::top("top").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Animation + Opacity");
                ui.add(egui::Slider::new(&mut self.speed, 0.1..=6.0).text("speed"));
                ui.add(egui::Slider::new(&mut self.alpha, 0.0..=1.0).text("alpha"));
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            let rect = ui.max_rect();
            let painter = ui.painter_at(rect);

            let center = rect.center();
            let r = rect.width().min(rect.height()) * 0.25;

            let theta = (t * self.speed) % TAU;
            let x = center.x + r * theta.cos();
            let y = center.y + r * theta.sin();

            let a = (self.alpha.clamp(0.0, 1.0) * 255.0) as u8;
            let fill = egui::Color32::from_rgba_unmultiplied(90, 200, 255, a);

            painter.circle_filled(egui::pos2(x, y), 28.0, fill);
            painter.circle_stroke(
                center,
                r,
                egui::Stroke::new(2.0, egui::Color32::from_gray(140)),
            );

            ui.label("This example uses a repaint loop (native render).");
        });

        ctx.request_repaint();
    }
}

fn main() -> Result<(), eframe::Error> {
    rgui::run::<App>("rgui - animation_opacity")
}
