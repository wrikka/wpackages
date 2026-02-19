use eframe::egui;

pub fn password(ui: &mut egui::Ui, value: &mut String, hint: &str) -> egui::Response {
    ui.add(
        egui::TextEdit::singleline(value)
            .password(true)
            .hint_text(hint)
            .min_size(egui::vec2(0.0, 24.0)),
    )
}
