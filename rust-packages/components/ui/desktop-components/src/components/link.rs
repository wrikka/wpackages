use eframe::egui;

pub fn link(ui: &mut egui::Ui, text: impl Into<egui::WidgetText>) -> egui::Response {
    ui.link(text)
}
