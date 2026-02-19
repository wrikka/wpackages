use crate::app::state::IdeState;

pub fn handle_command_palette(ctx: &egui::Context, state: &mut IdeState) {
    if !state.ui.show_command_palette {
        return;
    }

    let _ = ctx;

    // TODO: Implement command-palette integration with controller + channels.
    // - Create command palette UI with search functionality
    // - Wire up command execution handlers
    // - Add keyboard shortcut support (Cmd/Ctrl+K)
    // For now, close immediately to keep IDE compiling.
    state.ui.show_command_palette = false;
}
