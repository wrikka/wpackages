use eframe::egui;

pub fn combobox(
    ui: &mut egui::Ui,
    id: impl std::hash::Hash,
    text: &mut String,
    options: &[String],
) -> egui::Response {
    let response = ui.text_edit_singleline(text);
    let popup_id = ui.id().with(id);

    if response.gained_focus() {
        egui::Popup::open_id(ui.ctx(), popup_id);
    }

    let mut popup_hovered = false;
    if egui::Popup::is_id_open(ui.ctx(), popup_id) {
        let popup_response = egui::Area::new(popup_id)
            .movable(false)
            .fixed_pos(response.rect.left_bottom())
            .show(ui.ctx(), |ui| {
                egui::Frame::popup(ui.style()).show(ui, |ui| {
                    egui::ScrollArea::vertical().show(ui, |ui| {
                        let filtered_options: Vec<_> = options
                            .iter()
                            .filter(|opt| opt.to_lowercase().starts_with(&text.to_lowercase()))
                            .collect();

                        if filtered_options.is_empty() {
                            ui.label("No results");
                        } else {
                            for option in filtered_options {
                                if ui.selectable_label(false, option).clicked() {
                                    *text = option.clone();
                                    egui::Popup::close_id(ui.ctx(), popup_id);
                                }
                            }
                        }
                    });
                });
            });

        if popup_response.response.hovered() {
            popup_hovered = true;
        }

        if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
            egui::Popup::close_id(ui.ctx(), popup_id);
        }
    }

    if response.lost_focus() && !popup_hovered {
        egui::Popup::close_id(ui.ctx(), popup_id);
    }

    response
}
