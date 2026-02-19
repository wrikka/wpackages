use eframe::egui;

pub fn select<T: Clone + PartialEq + ToString>(
    ui: &mut egui::Ui,
    id: impl std::hash::Hash,
    selected: &mut T,
    options: &[T],
) -> egui::Response {
    egui::ComboBox::from_id_salt(id)
        .selected_text(selected.to_string())
        .show_ui(ui, |ui: &mut egui::Ui| {
            for option in options {
                ui.selectable_value(selected, option.clone(), option.to_string());
            }
        })
        .response
}
