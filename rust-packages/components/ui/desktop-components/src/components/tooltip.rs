use eframe::egui;

pub fn tooltip(response: egui::Response, text: impl Into<egui::WidgetText>) -> egui::Response {
    response.on_hover_text_at_pointer(text)
}
