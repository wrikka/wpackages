use super::types::{TerminalShell, TerminalState};
use egui::Ui;

pub enum TerminalAction {
    NewTab(TerminalShell),
    SetActiveTab(usize),
    SendInput(String),
}

pub fn show(ui: &mut Ui, state: &mut TerminalState) -> Option<TerminalAction> {
    let mut action = None;

    let Some(active_tab_idx) = state.active_tab else {
        ui.label("No active terminal tab.");
        return None;
    };

    let active_tab_id = state.tabs.get(active_tab_idx).map(|t| t.tab_id.clone());

    ui.horizontal(|ui| {
        for (idx, tab) in state.tabs.iter().enumerate() {
            if ui
                .selectable_label(state.active_tab == Some(idx), &tab.title)
                .clicked()
            {
                action = Some(TerminalAction::SetActiveTab(idx));
            }
        }

        if ui.button("+").clicked() {
            action = Some(TerminalAction::NewTab(TerminalShell::Pwsh));
        }
    });

    ui.separator();

    let Some(active_tab) = state.tabs.get_mut(active_tab_idx) else {
        ui.label(format!("Active terminal tab {} not found.", active_tab_idx));
        return None;
    };

    egui::ScrollArea::vertical()
        .id_salt(format!(
            "terminal_out_{}",
            active_tab_id.unwrap_or_default()
        ))
        .stick_to_bottom(true)
        .show(ui, |ui| {
            ui.with_layout(egui::Layout::top_down(egui::Align::Min), |ui| {
                ui.monospace(&active_tab.buffer);
            });
        });

    ui.separator();
    let resp = ui.add(
        egui::TextEdit::singleline(&mut active_tab.input)
            .hint_text("Type a command...")
            .desired_width(f32::INFINITY),
    );

    if resp.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter)) {
        action = Some(TerminalAction::SendInput(active_tab.input.clone()));
        state.tabs[active_tab_idx].input.clear();
        resp.request_focus();
    }

    action
}
