use crate::app::{
    actions,
    state::{CenterTab, IdeState},
};
use crate::types::ui::ModalKind;

pub fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    ui.horizontal(|ui| {
        tab_button(ui, state, CenterTab::Editor, "Editor");
        modal_button(ui, state, ModalKind::Git, "Git");
        modal_button(ui, state, ModalKind::GitHub, "GitHub");
        modal_button(ui, state, ModalKind::Extensions, "Extensions");
        modal_button(ui, state, ModalKind::Settings, "Settings");

        ui.separator();

        if ui.button("Open Project").clicked() {
            actions::add_project(state);
        }

        if let Some(idx) = state.workspace.selected_project {
            if let Some(root) = state.workspace.projects.get(idx) {
                ui.label(root);
            }
        }

        if let Some(err) = &state.ui.last_error {
            ui.separator();
            ui.colored_label(egui::Color32::from_rgb(255, 120, 120), err);
        }
    });
}

fn tab_button(ui: &mut egui::Ui, state: &mut IdeState, tab: CenterTab, label: &str) {
    let selected = state.ui.center_tab == tab;
    if ui.selectable_label(selected, label).clicked() {
        actions::set_center_tab(state, tab);
    }
}

fn modal_button(ui: &mut egui::Ui, state: &mut IdeState, kind: ModalKind, label: &str) {
    let selected = state.ui.active_modal == Some(kind);
    if ui.selectable_label(selected, label).clicked() {
        actions::set_active_modal(state, kind);
    }
}
