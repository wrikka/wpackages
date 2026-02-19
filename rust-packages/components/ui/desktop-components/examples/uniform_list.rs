use eframe::egui;
use rsui::{RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp;

impl RguiApp for MyApp {
    fn update(&mut self, ctx: &egui::Context) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Uniform List Example");

            let _text_height = egui::TextStyle::Body.resolve(ui.style()).size;
            let num_rows = 1000;

            egui::ScrollArea::vertical().show(ui, |ui| {
                egui::Grid::new("uniform_list")
                    .num_columns(1)
                    .show(ui, |ui| {
                        for i in 0..num_rows {
                            ui.label(format!("Row number {}", i));
                            ui.end_row();
                        }
                    });
            });
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Uniform List", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp)
    })
}
