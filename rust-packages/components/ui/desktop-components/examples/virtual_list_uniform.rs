use rgui::RguiApp;

#[derive(Default)]
struct App {
    items: usize,
    row_h: f32,
}

impl RguiApp for App {
    fn update(&mut self, ctx: &egui::Context) {
        egui::TopBottomPanel::top("top").show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("Uniform Virtual List (show_rows)");
                ui.add(egui::Slider::new(&mut self.items, 1_000..=200_000).text("items"));
                ui.add(egui::Slider::new(&mut self.row_h, 14.0..=40.0).text("row height"));
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.label("Only visible rows are laid out and painted.");
            ui.add_space(8.0);

            let text_style = egui::TextStyle::Monospace;
            let row_h = ui.text_style_height(&text_style).max(self.row_h);

            egui::ScrollArea::vertical()
                .id_salt("virtual_list")
                .auto_shrink([false, false])
                .show_rows(ui, row_h, self.items, |ui, range| {
                    for i in range {
                        ui.horizontal(|ui| {
                            ui.label(egui::RichText::new(format!("{:08}", i)).monospace());
                            ui.label("row");
                            ui.label(egui::RichText::new("fast").weak());
                        });
                    }
                });
        });
    }
}

fn main() -> Result<(), eframe::Error> {
    rgui::run_with("rgui - virtual_list_uniform", |_cc| {
        Ok(App {
            items: 50_000,
            row_h: 20.0,
        })
    })
}
