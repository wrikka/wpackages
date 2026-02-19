use eframe::egui;

pub fn checkbox(ui: &mut egui::Ui, checked: &mut bool, text: &str) -> egui::Response {
    ui.checkbox(checked, text)
}
