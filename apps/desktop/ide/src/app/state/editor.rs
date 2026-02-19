use crate::types::editor::OpenFileTab;

#[derive(Default)]
pub struct EditorState {
    pub selected_text: String,
    pub open_files: Vec<OpenFileTab>,
    pub active_file: Option<usize>,
    pub editor_dirty: bool,
}
