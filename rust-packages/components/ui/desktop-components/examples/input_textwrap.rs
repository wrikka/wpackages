use rgui::RguiApp;

#[derive(Default)]
struct App {
    input: String,
    width: f32,
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("top").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Input + Text Wrap");
                ui.add(egui::Slider::new(&mut self.width, 240.0..=920.0).text("wrap width"));
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.label("Type text below. The preview wraps at the chosen width.");
            ui.add_space(8.0);

            ui.add(
                egui::TextEdit::multiline(&mut self.input)
                    .desired_rows(6)
                    .desired_width(f32::INFINITY)
                    .hint_text("Write something…"),
            );

            ui.separator();
            ui.heading("Preview");

            egui::Frame::group(ui.style())
                .inner_margin(egui::Margin::same(10))
                .show(ui, |ui| {
                    ui.set_max_width(self.width.max(0.0));
                    ui.label(egui::RichText::new(&self.input));
                });
        });
    }
}

fn main() -> Result<(), eframe::Error> {
    rgui::run::<App>("rgui - input_textwrap")
}
