use crate::app::state::blame_heatmap::{BlameHeatmapState, HeatmapViewMode, HeatmapColorScheme};
use egui::{Context, Ui, ScrollArea, Color32, RichText};

pub fn render_blame_heatmap_panel(
    ctx: &Context,
    state: &mut BlameHeatmapState,
) {
    egui::Window::new("🔥 Blame Heatmap")
        .collapsible(true)
        .resizable(true)
        .default_width(600.0)
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("View Mode:");
                ui.radio_value(&mut state.view_mode, HeatmapViewMode::Age, "Age");
                ui.radio_value(&mut state.view_mode, HeatmapViewMode::Author, "Author");
                ui.radio_value(&mut state.view_mode, HeatmapViewMode::Both, "Both");
            });

            ui.horizontal(|ui| {
                ui.label("Color Scheme:");
                ui.radio_value(&mut state.color_scheme, HeatmapColorScheme::AgeGradient, "Gradient");
                ui.radio_value(&mut state.color_scheme, HeatmapColorScheme::AuthorColor, "Author");
                ui.radio_value(&mut state.color_scheme, HeatmapColorScheme::Heatmap, "Heatmap");
            });

            ui.horizontal(|ui| {
                ui.checkbox(&mut state.show_authors, "Show Authors");
                ui.label(format!("Age: {}-{} days", state.min_age_threshold, state.max_age_threshold));
            });

            ui.separator();

            ui.heading("Author Statistics");
            ScrollArea::vertical()
                .max_height(300.0)
                .show(ui, |ui| {
                    for (file_path, heatmap) in &state.heatmap_data {
                        ui.group(|ui| {
                            ui.label(&file_path);

                            for (author, stats) in &heatmap.author_stats {
                                ui.horizontal(|ui| {
                                    ui.label(&author);
                                    ui.label(format!("{} lines ({:.1}%)", stats.line_count, stats.percentage));
                                    ui.label(format!("Avg age: {:.0} days", stats.avg_age_days));
                                });
                            }
                        });
                    }
                });
        });
}

pub fn render_blame_heatmap_legend(ui: &mut Ui, state: &BlameHeatmapState) {
    ui.group(|ui| {
        ui.label("Heatmap Legend:");

        ui.horizontal(|ui| {
            ui.colored_rect(Color32::from_rgb(0, 255, 0), [10.0, 10.0]);
            ui.label("0-30 days");
        });

        ui.horizontal(|ui| {
            ui.colored_rect(Color32::from_rgb(255, 255, 0), [10.0, 10.0]);
            ui.label("30-90 days");
        });

        ui.horizontal(|ui| {
            ui.colored_rect(Color32::from_rgb(255, 128, 0), [10.0, 10.0]);
            ui.label("90-180 days");
        });

        ui.horizontal(|ui| {
            ui.colored_rect(Color32::from_rgb(255, 0, 0), [10.0, 10.0]);
            ui.label("180+ days");
        });
    });
}
