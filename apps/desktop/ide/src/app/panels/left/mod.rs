mod context_menu;
mod entry_windows;
mod file_tree;

pub use file_tree::render_file_tree;

use crate::app::state::IdeState;

pub fn render(ui: &mut egui::Ui, state: &mut IdeState) {
    file_tree::render_file_tree(ui, state);
    entry_windows::render_entry_windows(ui, state);
    context_menu::render_context_menu(ui, state);
}
