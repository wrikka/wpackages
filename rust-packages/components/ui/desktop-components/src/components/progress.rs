use eframe::egui;

pub fn progress(ui: &mut egui::Ui, progress: f32) -> egui::Response {
    ui.add(egui::ProgressBar::new(progress).show_percentage())
}
