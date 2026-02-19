use eframe::egui::{self, Widget};
use extensions::prelude::ExtensionManifest;

/// A view that displays a list of installed extensions and allows managing them.
pub struct ExtensionsView {
    extensions: Vec<ExtensionManifest>,
}

impl ExtensionsView {
    pub fn new(extensions: Vec<ExtensionManifest>) -> Self {
        Self { extensions }
    }
}

impl Widget for ExtensionsView {
    fn ui(self, ui: &mut egui::Ui) -> egui::Response {
        ui.vertical(|ui| {
            egui::ScrollArea::vertical().show(ui, |ui| {
                for ext in &self.extensions {
                    ui.group(|ui| {
                        ui.horizontal(|ui| {
                            // Note: Adding an icon for the extension would require:
                            // - Loading icon from extension manifest or assets
                            // - Using egui's image widget or icon library
                            // For now, this is a placeholder that would be replaced with actual icon display
                            ui.vertical(|ui| {
                                ui.strong(&ext.name);
                                ui.label(&ext.author);
                            });
                            ui.with_layout(
                                egui::Layout::right_to_left(egui::Align::Center),
                                |ui| {
                                    if ui.button("Uninstall").clicked() {
                                        // Note: Uninstall would require calling the extension manager
                                        // to remove the extension from the system
                                        // For now, this is a placeholder that would be replaced with actual uninstall logic
                                    }
                                    if ui.button("Disable").clicked() {
                                        // Note: Disable would require calling the extension manager
                                        // to disable the extension without removing it
                                        // For now, this is a placeholder that would be replaced with actual disable logic
                                    }
                                },
                            );
                        });
                        ui.label(&ext.description);
                    });
                    ui.separator();
                }
            });
        })
        .response
    }
}
