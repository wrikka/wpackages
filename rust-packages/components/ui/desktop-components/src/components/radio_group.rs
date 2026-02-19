use eframe::egui;

pub fn radio_group<T: Clone + PartialEq + ToString>(
    ui: &mut egui::Ui,
    group_value: &mut T,
    options: &[(T, &str)],
) {
    ui.vertical(|ui| {
        for (value, label) in options {
            ui.radio_value(group_value, value.clone(), label.to_string());
        }
    });
}
