use crate::error::Result;
use ratatui::{
    layout::Rect,
    style::{Color, Style},
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, ListState},
    Frame,
};
use std::path::Path;

pub struct FileExplorer {
    workspaces: Vec<String>,
    active_workspace_index: usize,
    current_path: String,
    files: Vec<String>,
    selected_index: usize,
    is_visible: bool,
}

impl Default for FileExplorer {
    fn default() -> Self {
        Self::new()
    }
}

impl FileExplorer {
    pub fn new() -> Self {
        let initial_path = ".".to_string();
        Self {
            workspaces: vec![initial_path.clone()],
            active_workspace_index: 0,
            current_path: initial_path,
            files: Vec::new(),
            selected_index: 0,
            is_visible: false,
        }
    }

    pub fn add_workspace(&mut self, path: &str) {
        self.workspaces.push(path.to_string());
    }

    pub fn set_active_workspace(&mut self, index: usize) -> Result<()> {
        if index < self.workspaces.len() {
            self.active_workspace_index = index;
            self.set_path(&self.workspaces[index].clone())?;
        }
        Ok(())
    }

    pub fn is_visible(&self) -> bool {
        self.is_visible
    }

    pub fn set_visible(&mut self, visible: bool) {
        self.is_visible = visible;
    }

    pub fn current_path(&self) -> &str {
        &self.current_path
    }

    pub fn set_path(&mut self, path: &str) -> Result<()> {
        self.current_path = path.to_string();
        self.refresh_files()?;
        Ok(())
    }

    pub fn refresh_files(&mut self) -> Result<()> {
        self.files.clear();

        let path = Path::new(&self.current_path);
        if path.exists() && path.is_dir() {
            for entry in std::fs::read_dir(path)? {
                let entry = entry?;
                let file_name = entry.file_name();
                let file_name_str = file_name.to_string_lossy().to_string();

                if entry.path().is_dir() {
                    self.files.push(format!("{}/", file_name_str));
                } else {
                    self.files.push(file_name_str);
                }
            }
        }

        self.files.sort();
        self.selected_index = 0;

        Ok(())
    }

    pub fn selected_file(&self) -> Option<&str> {
        self.files.get(self.selected_index).map(|s| s.as_str())
    }

    pub fn move_up(&mut self) {
        if self.selected_index > 0 {
            self.selected_index -= 1;
        }
    }

    pub fn move_down(&mut self) {
        if self.selected_index + 1 < self.files.len() {
            self.selected_index += 1;
        }
    }

    pub fn select(&mut self) -> Result<Option<String>> {
        if let Some(file) = self.selected_file() {
            let file_path = format!("{}/{}", self.current_path, file);

            if file.ends_with('/') {
                self.set_path(&file_path)?;
                Ok(None)
            } else {
                Ok(Some(file_path))
            }
        } else {
            Ok(None)
        }
    }

    pub fn render(&self, frame: &mut Frame, area: Rect) {
        let items: Vec<ListItem> = self
            .files
            .iter()
            .enumerate()
            .map(|(i, file)| {
                let style = if i == self.selected_index {
                    Style::default().bg(Color::Blue).fg(Color::White)
                } else {
                    Style::default()
                };

                let text = if file.ends_with('/') {
                    format!("📁 {}", file)
                } else {
                    format!("📄 {}", file)
                };

                ListItem::new(Line::from(vec![Span::styled(text, style)]))
            })
            .collect();

        let mut list_state = ListState::default();
        list_state.select(Some(self.selected_index));

        let block = Block::default()
            .title("File Explorer")
            .borders(Borders::ALL);

        let list = List::new(items)
            .block(block)
            .highlight_style(Style::default().add_modifier(ratatui::style::Modifier::BOLD));

        frame.render_stateful_widget(list, area, &mut list_state);
    }
}
