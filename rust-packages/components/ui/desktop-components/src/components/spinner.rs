use eframe::egui;

pub fn spinner(ui: &mut egui::Ui) -> egui::Response {
    ui.add(egui::Spinner::new())
}
