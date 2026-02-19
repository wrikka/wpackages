use crate::app::state::offline_ai::{OfflineAiState, Quantization};
use egui::{Context, Ui, ScrollArea, Color32};

pub fn render_offline_ai_panel(
    ctx: &Context,
    state: &mut OfflineAiState,
) {
    egui::Window::new("🤖 Offline AI")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.checkbox(&mut state.is_enabled, "Enabled");
                ui.checkbox(&mut state.use_local_when_available, "Use Local");
                ui.checkbox(&mut state.fallback_to_cloud, "Fallback to Cloud");
                ui.checkbox(&mut state.gpu_acceleration, "GPU Acceleration");
            });

            ui.separator();

            ui.heading("Available Models");
            ScrollArea::vertical()
                .max_height(300.0)
                .show(ui, |ui| {
                    for model in &state.models {
                        render_model(ui, model, state);
                    }
                });

            ui.separator();

            if let Some(active_model) = state.get_active_model() {
                ui.heading(format!("Active Model: {}", active_model.name));
                ui.label(format!("Size: {} MB", active_model.size_mb));
                ui.label(format!("Quantization: {:?}", active_model.quantization));

                ui.separator();

                ui.horizontal(|ui| {
                    if ui.button("⏹️ Unload").clicked() {
                        state.unload_model(&active_model.id);
                    }
                });
            } else {
                ui.label("No active model. Select a model to use.");
            }
        });
}

fn render_model(ui: &mut Ui, model: &crate::app::state::offline_ai::LocalModel, state: &OfflineAiState) {
    ui.group(|ui| {
        ui.horizontal(|ui| {
            ui.label(&model.name);
            ui.label(format!("{} MB", model.size_mb));
            ui.label(format!("{:?}", model.quantization));

            if model.is_loaded {
                ui.colored_label(Color32::LIGHT_GREEN, "✓ Loaded");
            } else if model.is_downloaded {
                ui.colored_label(Color32::LIGHT_BLUE, "📥 Downloaded");
            } else {
                ui.colored_label(Color32::LIGHT_GRAY, "⬇️ Not Downloaded");
            }
        });

        ui.horizontal(|ui| {
            if !model.is_downloaded {
                if ui.button("📥 Download").clicked() {
                    state.download_model(&model.id);
                }
            } else if !model.is_loaded {
                if ui.button("▶️ Load").clicked() {
                    state.load_model(&model.id);
                }
            }

            if ui.button("🎯 Select").clicked() {
                state.select_model(model.id.clone());
            }
        });
    });
}
