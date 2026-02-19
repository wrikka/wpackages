use rsui::{button, ButtonVariant, RguiApp, RguiTheme};

struct App {
    clicks: u32,
    theme: RguiTheme,
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("rsui: Hello World");
            if button(ui, "Click", ButtonVariant::Primary, &self.theme).clicked() {
                self.clicks += 1;
            }
            ui.label(format!("clicks = {}", self.clicks));
        });
    }
}

fn main() -> Result<(), eframe::Error> {
    rsui::run_with("rsui - hello_world", |cc| {
        let theme = RguiTheme::default();
        rsui::apply_theme(&cc.egui_ctx, &theme);
        Ok(App { clicks: 0, theme })
    })
}
