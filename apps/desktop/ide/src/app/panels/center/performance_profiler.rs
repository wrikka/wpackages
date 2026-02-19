use crate::app::state::performance_profiler::{PerformanceProfilerState, ProfilerViewMode, TimeScale};
use egui::{Context, Ui, Color32};

pub fn render_performance_profiler_panel(
    ctx: &Context,
    state: &mut PerformanceProfilerState,
) {
    egui::Window::new("📊 Performance Profiler")
        .collapsible(true)
        .resizable(true)
        .default_size([900.0, 600.0])
        .show(ctx, |ui| {
            ui.horizontal(|ui| {
                ui.label("View Mode:");
                ui.radio_value(&mut state.view_mode, ProfilerViewMode::FlameGraph, "Flame Graph");
                ui.radio_value(&mut state.view_mode, ProfilerViewMode::CallTree, "Call Tree");
                ui.radio_value(&mut state.view_mode, ProfilerViewMode::Timeline, "Timeline");
            });

            ui.horizontal(|ui| {
                ui.label("Time Scale:");
                ui.radio_value(&mut state.time_scale, TimeScale::Microseconds, "µs");
                ui.radio_value(&mut state.time_scale, TimeScale::Milliseconds, "ms");
                ui.radio_value(&mut state.time_scale, TimeScale::Seconds, "s");
            });

            ui.separator();

            if state.is_profiling {
                ui.horizontal(|ui| {
                    ui.label("⏳ Profiling...");
                    if ui.button("⏹️ Stop").clicked() {
                        // TODO: Stop profiling
                    }
                });
            } else {
                ui.horizontal(|ui| {
                    if ui.button("▶️ Start Profiling").clicked() {
                        state.start_profiling();
                    }
                });
            }

            ui.separator();

            if let Some(selected) = &state.selected_function {
                ui.label(format!("Selected: {}", selected));
            }

            ui.separator();

            if let Some(flame_graph) = &state.flame_graph {
                render_flame_graph(ui, flame_graph, state);
            } else if let Some(data) = &state.profiling_data {
                ui.label("Profiling data loaded. Build flame graph to visualize.");
            } else {
                ui.label("No profiling data. Start profiling to collect data.");
            }
        });
}

fn render_flame_graph(
    ui: &mut Ui,
    flame_graph: &crate::app::state::performance_profiler::FlameGraphNode,
    state: &PerformanceProfilerState,
) {
    let painter = ui.painter();
    let rect = ui.available_size();

    let max_depth = calculate_max_depth(flame_graph);
    let width_per_depth = rect.x / (max_depth as f32 + 1.0);

    render_flame_node(ui, painter, flame_graph, 0.0, 0.0, width_per_depth, state);
}

fn calculate_max_depth(node: &crate::app::state::performance_profiler::FlameGraphNode) -> usize {
    node.children.iter()
        .map(|c| calculate_max_depth(c))
        .max()
        .unwrap_or(0)
        .max(node.depth)
}

fn render_flame_node(
    ui: &mut Ui,
    painter: &egui::Painter,
    node: &crate::app::state::performance_profiler::FlameGraphNode,
    x: f32,
    y: f32,
    width: f32,
    state: &PerformanceProfilerState,
) {
    let height = 30.0;
    let color = get_node_color(node, state);

    let rect = egui::Rect::from_min_size(egui::pos2(x, y), egui::vec2(width, height));
    painter.rect_filled(rect, 0.0, color);

    if width > 50.0 {
        painter.text(
            egui::pos2(x + width / 2.0, y + height / 2.0),
            egui::Align2::CENTER_CENTER,
            &node.name,
            egui::FontId::default(),
            Color32::BLACK,
        );
    }

    let mut child_x = x;
    for child in &node.children {
        let child_width = (child.duration / node.duration) * width;
        render_flame_node(ui, painter, child, child_x, y + height, child_width, state);
        child_x += child_width;
    }
}

fn get_node_color(
    node: &crate::app::state::performance_profiler::FlameGraphNode,
    state: &PerformanceProfilerState,
) -> Color32 {
    if state.selected_function.as_ref() == Some(&node.name) {
        Color32::LIGHT_BLUE
    } else {
        Color32::from_rgb(
            (255.0 * (node.depth as f32 / 10.0)) as u8,
            (200.0 * (1.0 - node.depth as f32 / 10.0)) as u8,
            100,
        )
    }
}
