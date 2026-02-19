use eframe::egui;

pub fn number_input<N: egui::emath::Numeric + std::ops::AddAssign + std::ops::SubAssign>(
    ui: &mut egui::Ui,
    value: &mut N,
) -> egui::Response {
    ui.horizontal(|ui| {
        if ui.button("-").clicked() {
            *value -= N::from_f64(1.0);
        }
        let response = ui.add(egui::DragValue::new(value));
        if ui.button("+").clicked() {
            *value += N::from_f64(1.0);
        }
        response
    })
    .inner
}
