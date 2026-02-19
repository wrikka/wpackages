use crate::types::{fs::FileNode, paths::AbsPath};
use egui::Pos2;
use std::collections::HashSet;

#[derive(Default)]
pub struct FsState {
    pub file_tree: Vec<FileNode>,
    pub file_search: String,
    pub expanded_dirs: HashSet<AbsPath>,
    pub show_file_size: bool,
    pub show_file_lines: bool,
    pub rename_target: Option<String>,
    pub rename_buffer: String,
    pub rename_just_opened: bool,
    pub new_entry_parent: Option<String>,
    pub new_entry_is_dir: bool,
    pub new_entry_buffer: String,
    pub new_entry_just_opened: bool,
    pub selected_file: Option<AbsPath>,
    pub context_menu_target: Option<String>,
    pub context_menu_is_dir: bool,
    pub context_menu_pos: Option<Pos2>,
}
