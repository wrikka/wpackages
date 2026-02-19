use egui::Widget;

/// Represents an extension that is available for installation.
#[derive(Clone, Debug)]
pub struct AvailableExtension {
    pub name: String,
    pub author: String,
    pub description: String,
    pub version: String,
}

/// A view that displays a list of available extensions for discovery and installation.
pub struct DiscoveryView {
    available: Vec<AvailableExtension>,
}

impl DiscoveryView {
    pub fn new(available: Vec<AvailableExtension>) -> Self {
        Self { available }
    }
}

impl Widget for DiscoveryView {
    fn ui(self, ui: &mut egui::Ui) -> egui::Response {
        ui.vertical(|ui| {
            // For now, we use mock data.
            // Note: Fetching from a real registry/marketplace would require:
            // - Setting up a client to query the extension registry API
            // - Handling authentication and rate limiting
            // - Caching results to improve performance
            // For now, this is a placeholder that would be replaced with actual registry integration
            egui::ScrollArea::vertical().show(ui, |ui| {
                for ext in &self.available {
                    ui.group(|ui| {
                        ui.horizontal(|ui| {
                            ui.vertical(|ui| {
                                ui.strong(&ext.name);
                                ui.label(&ext.author);
                            });
                            ui.with_layout(
                                egui::Layout::right_to_left(egui::Align::Center),
                                |ui| {
                                    if ui.button("Install").clicked() {
                                        // Note: Install would require calling the extension manager
                                        // to download and install the extension
                                        // For now, this is a placeholder that would be replaced with actual install logic
                                    }
                                    ui.label(format!("v{}", ext.version));
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
