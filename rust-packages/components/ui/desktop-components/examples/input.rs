use rsui::{self, RsuiApp, RsuiTheme};

#[derive(Default)]
struct MyApp {
    text: String,
}

impl RsuiApp for MyApp {
    fn update(&mut self, ctx: &eframe::egui::Context) {
        eframe::egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Input Example");
            ui.add_space(10.0);
            rsui::text_input(ui, &mut self.text, "Enter text here...");
            ui.add_space(10.0);
            ui.label(format!("You wrote: {}", self.text));
        });
    }
}

fn main() -> eframe::Result<()> {
    rsui::run_with("Input", |cc| {
        rsui::apply_theme(&cc.egui_ctx, RsuiTheme::default());
        Ok(MyApp::default())
    })
}
