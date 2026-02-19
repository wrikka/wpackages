use eframe::{egui, egui::ColorImage};
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp {
    texture: Option<egui::TextureHandle>,
}

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        let texture: &egui::TextureHandle = self.texture.get_or_insert_with(|| {
            ctx.load_texture("example-image", ColorImage::example(), Default::default())
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Image Example");
            ui.image(texture);
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Image", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp::default())
    })
}
