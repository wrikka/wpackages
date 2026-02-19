use crate::app::{panels, state::IdeState};

pub fn render_main_ui(ctx: &egui::Context, state: &mut IdeState) {
    egui::TopBottomPanel::top("top").show(ctx, |ui| panels::top_bar::render(ui, state));

    egui::SidePanel::left("repos")
        .min_width(300.0)
        .show(ctx, |ui| panels::left::render(ui, state));

    egui::SidePanel::right("agent")
        .min_width(300.0)
        .default_width(360.0)
        .max_width(420.0)
        .show(ctx, |ui| panels::right_chat::render(ui, state));

    egui::CentralPanel::default().show(ctx, |ui| {
        ui.set_min_width(640.0);
        panels::center::render(ui, state)
    });

    if state.terminal.show_terminal {
        egui::TopBottomPanel::bottom("terminal")
            .resizable(true)
            .default_height(220.0)
            .show(ctx, |ui| panels::terminal::render(ui, state));
    }

    egui::TopBottomPanel::bottom("status").show(ctx, |ui| panels::status_bar::render(ui, state));
}
