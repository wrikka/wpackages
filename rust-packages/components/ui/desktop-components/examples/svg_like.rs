use rgui::RguiApp;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
enum ColorMode {
    #[default]
    Cyan,
    Orange,
    Pink,
}

#[derive(Default)]
struct App {
    mode: ColorMode,
    rotate: bool,
    t: f32,
}

fn star_points(
    center: egui::Pos2,
    r_outer: f32,
    r_inner: f32,
    points: usize,
    rot: f32,
) -> Vec<egui::Pos2> {
    let mut out = Vec::with_capacity(points * 2);
    let step = std::f32::consts::TAU / points as f32;
    for i in 0..points {
        let a0 = rot + i as f32 * step;
        let a1 = a0 + step * 0.5;
        out.push(egui::pos2(
            center.x + r_outer * a0.cos(),
            center.y + r_outer * a0.sin(),
        ));
        out.push(egui::pos2(
            center.x + r_inner * a1.cos(),
            center.y + r_inner * a1.sin(),
        ));
    }
    out
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("top").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.heading("SVG-like Vector");
                ui.label("(vector path, recolorable)");

                ui.separator();

                ui.selectable_value(&mut self.mode, ColorMode::Cyan, "Cyan");
                ui.selectable_value(&mut self.mode, ColorMode::Orange, "Orange");
                ui.selectable_value(&mut self.mode, ColorMode::Pink, "Pink");

                ui.separator();

                ui.checkbox(&mut self.rotate, "Rotate");
            });
        });

        let fill = match self.mode {
            ColorMode::Cyan => egui::Color32::from_rgb(90, 200, 255),
            ColorMode::Orange => egui::Color32::from_rgb(255, 170, 80),
            ColorMode::Pink => egui::Color32::from_rgb(255, 90, 160),
        };

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.label("This is rendered using egui painter paths (no raster SVG loader).");
            ui.add_space(10.0);

            let rect = ui.available_rect_before_wrap();
            let rect = rect.shrink(20.0);

            let center = rect.center();
            let size = rect.width().min(rect.height());
            let r_outer = size * 0.22;
            let r_inner = r_outer * 0.48;

            let rot = if self.rotate { self.t } else { 0.0 };
            let pts = star_points(center, r_outer, r_inner, 5, rot);

            let stroke = egui::Stroke::new(2.0, egui::Color32::from_gray(160));
            let path = egui::epaint::PathShape::closed_line(pts, stroke);

            let painter = ui.painter();
            painter.add(egui::Shape::convex_polygon(
                star_points(center, r_outer, r_inner, 5, rot),
                fill.gamma_multiply(0.85),
                egui::Stroke::NONE,
            ));
            painter.add(path);

            ui.allocate_space(ui.available_size());
        });

        if self.rotate {
            self.t = (self.t + 0.02) % std::f32::consts::TAU;
            ctx.request_repaint();
        }
    }
}

fn main() -> eframe::Result<()> {
    rgui::run::<App>("rgui - svg_like")
}
