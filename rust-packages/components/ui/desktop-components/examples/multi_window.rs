use rgui::{button, ButtonVariant, RguiApp, RguiTheme};

struct App {
    show_tool: bool,
    show_about: bool,
    theme: RguiTheme,
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("top").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.heading("Multi-window (viewport)");

                if button(ui, "Open Tool Window", ButtonVariant::Primary, &self.theme).clicked() {
                    self.show_tool = true;
                }
                if button(
                    ui,
                    "Open About Window",
                    ButtonVariant::Secondary,
                    &self.theme,
                )
                .clicked()
                {
                    self.show_about = true;
                }

                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    if button(ui, "Close App", ButtonVariant::Danger, &self.theme).clicked() {
                        ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                    }
                });
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.label("This uses egui viewports (native). No webview.");
            ui.add_space(8.0);
            ui.label(format!("tool window: {}", self.show_tool));
            ui.label(format!("about window: {}", self.show_about));
        });

        if self.show_tool {
            let theme = self.theme.clone();
            ctx.show_viewport_immediate(
                egui::ViewportId::from_hash_of("tool"),
                egui::ViewportBuilder::default()
                    .with_title("Tool Window")
                    .with_inner_size([520.0, 320.0]),
                |ctx, _class| {
                    egui::CentralPanel::default().show(ctx, |ui| {
                        ui.heading("Tool Window");
                        ui.label("Try moving/resizing this window.");
                        ui.add_space(10.0);

                        if button(ui, "Close Tool", ButtonVariant::Secondary, &theme).clicked() {
                            ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                        }
                        if button(ui, "Request Focus", ButtonVariant::Primary, &theme).clicked() {
                            ctx.send_viewport_cmd(egui::ViewportCommand::Focus);
                        }
                    });
                },
            );
        }

        if self.show_about {
            let theme = self.theme.clone();
            ctx.show_viewport_immediate(
                egui::ViewportId::from_hash_of("about"),
                egui::ViewportBuilder::default()
                    .with_title("About")
                    .with_inner_size([420.0, 220.0]),
                |ctx, _class| {
                    egui::CentralPanel::default().show(ctx, |ui| {
                        ui.heading("About rgui");
                        ui.label("Native UI toolkit layer for wterminal.");
                        ui.add_space(10.0);
                        if button(ui, "Close About", ButtonVariant::Secondary, &theme).clicked() {
                            ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                        }
                    });
                },
            );
        }

        // Keep state in sync with actual window close events
        if ctx.input(|i| i.viewport().close_requested()) {
            self.show_tool = false;
            self.show_about = false;
        }
    }
}

fn main() -> eframe::Result<()> {
    rgui::run_with("rgui - multi_window", |cc| {
        let theme = RguiTheme::default();
        rgui::apply_theme(&cc.egui_ctx, &theme);
        Ok(App {
            show_tool: false,
            show_about: false,
            theme,
        })
    })
}
