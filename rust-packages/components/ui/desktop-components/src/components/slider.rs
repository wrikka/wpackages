use eframe::egui;

pub fn slider<Num: eframe::emath::Numeric>(
    ui: &mut egui::Ui,
    value: &mut Num,
    range: std::ops::RangeInclusive<Num>,
    text: &str,
) -> egui::Response {
    ui.add(egui::Slider::new(value, range).text(text))
}
