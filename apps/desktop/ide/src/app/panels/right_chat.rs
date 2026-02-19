use crate::app::state::IdeState;

pub fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    if let Some(action) = ai::show(ui, &mut state.chat, &state.fs.file_tree) {
        match action {
            ai::ChatAction::SendMessage => {
                state.set_error("Chat: send message is not implemented");
            }
        }
    }
}
