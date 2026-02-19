use eframe::egui;

pub fn icon(ui: &mut egui::Ui, character: char) -> egui::Response {
    ui.label(egui::RichText::new(character.to_string()).font(egui::FontId::proportional(20.0)))
}
