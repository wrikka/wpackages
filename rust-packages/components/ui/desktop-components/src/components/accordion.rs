use eframe::egui;

pub fn accordion<R>(
    ui: &mut egui::Ui,
    _id: impl std::hash::Hash,
    title: impl Into<String>,
    add_contents: impl FnOnce(&mut egui::Ui) -> R,
) -> egui::InnerResponse<Option<R>> {
    let response = ui.collapsing(title.into(), add_contents);
    egui::InnerResponse::new(response.body_returned, response.header_response)
}
