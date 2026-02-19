use crate::app::{actions, state::IdeState};

pub fn render_entry_windows(ui: &mut egui::Ui, state: &mut IdeState) {
    render_new_entry_window(ui, state);
    render_rename_window(ui, state);
}

fn render_new_entry_window(ui: &mut egui::Ui, state: &mut IdeState) {
    if state.fs.new_entry_parent.is_some() {
        egui::Window::new(if state.fs.new_entry_is_dir {
            "New Folder"
        } else {
            "New File"
        })
        .collapsible(false)
        .resizable(false)
        .show(ui.ctx(), |ui| {
            ui.label("Name");
            let resp = ui.add(
                egui::TextEdit::singleline(&mut state.fs.new_entry_buffer)
                    .desired_width(f32::INFINITY),
            );

            if state.fs.new_entry_just_opened {
                resp.request_focus();
                state.fs.new_entry_just_opened = false;
            }

            if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                actions::commit_new_entry(state);
            }

            if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
                actions::cancel_new_entry(state);
            }

            ui.horizontal(|ui| {
                if ui.button("Create").clicked() {
                    actions::commit_new_entry(state);
                }
                if ui.button("Cancel").clicked() {
                    actions::cancel_new_entry(state);
                }
            });
        });
    }
}

fn render_rename_window(ui: &mut egui::Ui, state: &mut IdeState) {
    if state.fs.rename_target.is_some() {
        egui::Window::new("Rename")
            .collapsible(false)
            .resizable(false)
            .show(ui.ctx(), |ui| {
                ui.label("New name");
                let resp = ui.add(
                    egui::TextEdit::singleline(&mut state.fs.rename_buffer)
                        .desired_width(f32::INFINITY),
                );

                if state.fs.rename_just_opened {
                    resp.request_focus();
                    state.fs.rename_just_opened = false;
                }

                if ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                    actions::commit_rename(state);
                }

                if ui.input(|i| i.key_pressed(egui::Key::Escape)) {
                    actions::cancel_rename(state);
                }

                ui.horizontal(|ui| {
                    if ui.button("Rename").clicked() {
                        actions::commit_rename(state);
                    }
                    if ui.button("Cancel").clicked() {
                        actions::cancel_rename(state);
                    }
                });
            });
    }
}
