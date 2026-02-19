use eframe::egui;

pub fn aspect_ratio<R>(
    ui: &mut egui::Ui,
    ratio: f32,
    add_contents: impl FnOnce(&mut egui::Ui) -> R,
) -> egui::InnerResponse<R> {
    let available_width = ui.available_width();
    let height = available_width / ratio;

    let (rect, response) =
        ui.allocate_exact_size(egui::vec2(available_width, height), egui::Sense::hover());
    let mut child_ui = ui.new_child(egui::UiBuilder::new().max_rect(rect).layout(*ui.layout()));
    let inner = add_contents(&mut child_ui);

    egui::InnerResponse::new(inner, response)
}
