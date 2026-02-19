use eframe::egui;
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp;

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Text Wrapping Example");
            ui.add_space(10.0);

            let long_text = "This is a long piece of text that will wrap when it reaches the edge of the available space. You can see how egui handles text layout automatically.";

            egui::ScrollArea::vertical().show(ui, |ui| {
                ui.label(long_text);
            });
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Text Wrapper", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp)
    })
}
