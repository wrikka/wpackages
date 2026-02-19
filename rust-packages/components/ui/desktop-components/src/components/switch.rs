use eframe::egui;

pub fn switch(ui: &mut egui::Ui, on: &mut bool) -> egui::Response {
    // A simple wrapper around egui's built-in toggle switch for now.
    // This can be replaced with a custom-styled widget later if needed.
    ui.toggle_value(on, "")
}
