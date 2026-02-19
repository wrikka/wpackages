use rgui::{button, ButtonVariant, RguiApp, RguiTheme};

struct App {
    show_about: bool,
    counter: u64,
    theme: RguiTheme,
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("menu").show(ctx, |ui| {
            egui::MenuBar::new().ui(ui, |ui| {
                ui.menu_button("File", |ui| {
                    if button(ui, "Increment", ButtonVariant::Ghost, &self.theme).clicked() {
                        self.counter = self.counter.saturating_add(1);
                        ui.close();
                    }
                    if button(ui, "Quit", ButtonVariant::Ghost, &self.theme).clicked() {
                        ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                        ui.close();
                    }
                });

                ui.menu_button("Help", |ui| {
                    if button(ui, "About", ButtonVariant::Ghost, &self.theme).clicked() {
                        self.show_about = true;
                        ui.close();
                    }
                });
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Menus + Window commands (native)");
            ui.label("This uses egui menu bar and viewport commands.");
            ui.label(format!("counter = {}", self.counter));

            ui.add_space(10.0);
            if button(ui, "Open About", ButtonVariant::Secondary, &self.theme).clicked() {
                self.show_about = true;
            }
        });

        if self.show_about {
            egui::Window::new("About")
                .open(&mut self.show_about)
                .resizable(false)
                .collapsible(false)
                .show(ctx, |ui| {
                    ui.heading("rgui");
                    ui.label("Native UI (no webview)");
                    ui.label("- Menu bar");
                    ui.label("- Viewport close");
                });
        }
    }
}

fn main() -> Result<(), eframe::Error> {
    rgui::run_with("rgui - window_menus", |cc| {
        let theme = RguiTheme::default();
        rgui::apply_theme(&cc.egui_ctx, &theme);
        Ok(App {
            show_about: false,
            counter: 0,
            theme,
        })
    })
}
