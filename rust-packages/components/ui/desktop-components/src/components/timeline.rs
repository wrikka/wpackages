use eframe::egui;

pub struct TimelineItem {
    pub title: String,
    pub content: String,
}

pub fn timeline(ui: &mut egui::Ui, items: &[TimelineItem]) {
    ui.vertical(|ui| {
        for (i, item) in items.iter().enumerate() {
            ui.horizontal(|ui| {
                ui.vertical(|ui| {
                    ui.painter().circle(
                        ui.cursor().min + egui::vec2(6.0, 6.0),
                        6.0,
                        ui.style().visuals.widgets.inactive.bg_fill,
                        ui.style().visuals.widgets.inactive.bg_stroke,
                    );
                    if i < items.len() - 1 {
                        ui.painter().vline(
                            ui.cursor().min.x + 6.0,
                            (ui.cursor().min.y + 12.0)..=(ui.cursor().min.y + 50.0),
                            ui.style().visuals.widgets.inactive.bg_stroke,
                        );
                    }
                });
                ui.add_space(20.0);
                ui.vertical(|ui| {
                    ui.strong(&item.title);
                    ui.label(&item.content);
                });
            });
            ui.add_space(10.0);
        }
    });
}
