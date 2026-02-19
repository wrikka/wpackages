use eframe::egui;

pub fn avatar(ui: &mut egui::Ui, text: impl Into<String>) -> egui::Response {
    let text = text.into();
    let initial = text
        .chars()
        .next()
        .unwrap_or(' ')
        .to_uppercase()
        .to_string();

    let (rect, response) = ui.allocate_exact_size(egui::vec2(32.0, 32.0), egui::Sense::hover());

    if ui.is_rect_visible(rect) {
        let visuals = ui.style().interact(&response);
        let color = visuals.bg_fill;
        ui.painter().circle_filled(rect.center(), 16.0, color);
        ui.painter().text(
            rect.center(),
            egui::Align2::CENTER_CENTER,
            initial,
            egui::FontId::proportional(16.0),
            visuals.text_color(),
        );
    }

    response
}
