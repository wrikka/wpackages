// Note: This example requires adding the `gif` and `image` crates.
// Due to current limitations, I cannot modify Cargo.toml automatically.
// Please add the following to your Cargo.toml:
// gif = "0.12"
// image = "0.24"

use eframe::{egui, egui::ColorImage};
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp {
    gif_data: Option<Vec<egui::TextureHandle>>,
    frame_index: usize,
}

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        if self.gif_data.is_none() {
            // This is a placeholder. In a real app, you'd load a GIF file.
            let images = vec![ColorImage::example(), ColorImage::example()];
            self.gif_data = Some(
                images
                    .into_iter()
                    .map(|img| ctx.load_texture("gif_frame", img, Default::default()))
                    .collect(),
            );
        }

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("GIF Viewer (Placeholder)");
            if let Some(frames) = &self.gif_data {
                self.frame_index = (self.frame_index + 1) % frames.len();
                ui.image(&frames[self.frame_index]);
                ui.ctx()
                    .request_repaint_after(std::time::Duration::from_millis(100));
            }
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("GIF Viewer", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp::default())
    })
}
