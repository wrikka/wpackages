use super::state::IdeState;

pub fn render_top_bar(ui: &mut egui::Ui, state: &mut IdeState) {
    super::panels::top_bar::render(ui, state);
}

pub fn render_left_panel(ui: &mut egui::Ui, state: &mut IdeState) {
    super::panels::left::render(ui, state);
}

pub fn render_center(ui: &mut egui::Ui, state: &mut IdeState) {
    super::panels::center::render(ui, state);
}

pub fn render_agent_panel(ui: &mut egui::Ui, state: &mut IdeState) {
    super::panels::right_chat::render(ui, state);
}

pub fn render_status_bar(ui: &mut egui::Ui, state: &mut IdeState) {
    super::panels::status_bar::render(ui, state);
}

pub fn render_command_palette(ctx: &egui::Context, state: &mut IdeState) {
    super::panels::command_palette::render(ctx, state);
}

pub fn render_terminal_panel(ui: &mut egui::Ui, state: &mut IdeState) {
    super::panels::terminal::render(ui, state);
}
