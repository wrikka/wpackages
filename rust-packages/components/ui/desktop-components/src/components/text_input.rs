use eframe::egui;

pub fn text_input(ui: &mut egui::Ui, value: &mut String, hint: &str) -> egui::Response {
    ui.add(
        egui::TextEdit::singleline(value)
            .hint_text(hint)
            .min_size(egui::vec2(0.0, 24.0)),
    )
}
