use eframe::egui;

pub fn textarea(ui: &mut egui::Ui, value: &mut String, hint: &str) -> egui::Response {
    ui.add(
        egui::TextEdit::multiline(value)
            .hint_text(hint)
            .min_size(egui::vec2(0.0, 60.0)),
    )
}
