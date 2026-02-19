use rsui::{button, ButtonVariant, RsuiApp, RsuiTheme};

struct App {
    radius: f32,
    blur: u8,
    spread: u8,
    theme: RguiTheme,
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("top").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Shadow");
                ui.add(egui::Slider::new(&mut self.radius, 0.0..=24.0).text("radius"));
                ui.add(egui::Slider::new(&mut self.blur, 0..=32).text("blur"));
                ui.add(egui::Slider::new(&mut self.spread, 0..=24).text("spread"));
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Shadow frame (native)");
            ui.label("Uses egui::Frame shadow + corner radius.");
            ui.add_space(10.0);

            let frame = egui::Frame::new()
                .fill(egui::Color32::from_rgb(25, 25, 28))
                .stroke(egui::Stroke::new(1.0, egui::Color32::from_gray(70)))
                .inner_margin(egui::Margin::same(14.0))
                .corner_radius(self.radius)
                .shadow(egui::epaint::Shadow {
                    blur: self.blur as f32,
                    spread: self.spread as f32,
                    color: egui::Color32::from_rgba_unmultiplied(0, 0, 0, 180),
                    offset: egui::Vec2::ZERO,
                });

            frame.show(ui, |ui| {
                ui.heading("Card");
                ui.label("This is a card with shadow.");
                ui.add_space(6.0);
                ui.horizontal(|ui| {
                    button(ui, "OK", ButtonVariant::Primary, &self.theme);
                    button(ui, "Cancel", ButtonVariant::Secondary, &self.theme);
                });
            });
        });
    }
}

fn main() -> Result<(), eframe::Error> {
    rsui::run_with("rsui - shadow", |cc| {
        let theme = RsuiTheme::default();
        rsui::apply_theme(&cc.egui_ctx, &theme);
        Ok(App {
            radius: 12.0,
            blur: 18,
            spread: 6,
            theme,
        })
    })
}
