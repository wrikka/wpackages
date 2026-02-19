use crate::app::state::{extensions::ExtensionsFilter, IdeState};

pub(crate) fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.heading("Extensions");
    ui.separator();

    ui.horizontal(|ui| {
        ui.add(
            egui::TextEdit::singleline(&mut state.extensions.extensions_query)
                .hint_text("Search extensions...")
                .desired_width(f32::INFINITY),
        );

        ui.separator();
        ui.selectable_value(
            &mut state.extensions.extensions_filter,
            ExtensionsFilter::All,
            "All",
        );
        ui.selectable_value(
            &mut state.extensions.extensions_filter,
            ExtensionsFilter::Installed,
            "Installed",
        );
        ui.selectable_value(
            &mut state.extensions.extensions_filter,
            ExtensionsFilter::NotInstalled,
            "Not Installed",
        );
    });

    ui.separator();
    egui::ScrollArea::vertical()
        .id_salt("extensions")
        .show(ui, |ui| {
            let q = state.extensions.extensions_query.trim().to_lowercase();

            let installed_len = state
                .extensions
                .extension_runtime
                .values()
                .filter(|rt| rt.installed)
                .count();

            if !q.is_empty() {
                ui.label(format!("Search is not wired yet: '{q}'"));
            }

            ui.label(format!("Installed (runtime): {installed_len}"));
        });
}
