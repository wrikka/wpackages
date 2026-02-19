use rgui::RguiApp;

#[derive(Default)]
struct App {
    tex: Option<egui::TextureHandle>,
    w: usize,
    h: usize,
}

impl App {
    fn ensure_tex(&mut self, ctx: &egui::Context) {
        if self.tex.is_some() {
            return;
        }

        let w = self.w;
        let h = self.h;

        let mut pixels = Vec::with_capacity(w * h);
        for y in 0..h {
            for x in 0..w {
                let r = (x as f32 / (w - 1) as f32 * 255.0) as u8;
                let g = (y as f32 / (h - 1) as f32 * 255.0) as u8;
                let b = (((x ^ y) & 0xFF) as u8).saturating_add(40);
                pixels.push(egui::Color32::from_rgb(r, g, b));
            }
        }

        let img = egui::ColorImage::from_rgba_unmultiplied(
            [w, h],
            &pixels
                .iter()
                .flat_map(|c| c.to_array())
                .collect::<Vec<u8>>(),
        );
        let tex = ctx.load_texture("procedural", img, egui::TextureOptions::LINEAR);
        self.tex = Some(tex);
    }
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        self.ensure_tex(ctx);

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Image (procedural texture)");
            ui.label("Generated on the fly and uploaded as a GPU texture.");

            if let Some(tex) = &self.tex {
                let max_w = ui.available_width().min(640.0);
                let scale = max_w / self.w as f32;
                let size = egui::vec2(self.w as f32 * scale, self.h as f32 * scale);
                ui.image((tex.id(), size));
            }
        });
    }
}

fn main() -> Result<(), eframe::Error> {
    rgui::run_with("rgui - image_procedural", |_cc| {
        Ok(App {
            w: 256,
            h: 256,
            ..Default::default()
        })
    })
}
