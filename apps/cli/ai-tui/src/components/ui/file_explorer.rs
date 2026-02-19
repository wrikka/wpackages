//! File Explorer widget with breadcrumbs, file type colors, and search
//!
//! The FileExplorer provides a filesystem navigation interface with:
//!
//! - Directory browsing with breadcrumbs
//! - File type detection and color coding
//! - Search/filter functionality
//! - Keyboard navigation
//!
//! # Example
//!
//! ```rust
//! use crate::components::ui::file_explorer::FileExplorer;
//! use std::path::PathBuf;
//!
//! let mut explorer = FileExplorer::new(PathBuf::from("."));
//! explorer.refresh();
//!
//! if let Some(item) = explorer.get_selected() {
//!     println!("Selected: {}", item.name);
//! }
//! ```

use crate::components::ui::{FileType, Theme};
use ratatui::{
    layout::Rect,
    style::Style,
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, ListState, Paragraph, Wrap},
    Frame,
};
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct FileExplorer {
    current_path: PathBuf,
    items: Vec<FileItem>,
    state: ListState,
    theme: Theme,
    search_query: Option<String>,
    filtered_items: Vec<usize>,
    show_breadcrumbs: bool,
}

#[derive(Debug, Clone)]
pub struct FileItem {
    pub name: String,
    pub path: PathBuf,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub file_type: FileType,
}

impl FileExplorer {
    pub fn new(path: PathBuf) -> Self {
        let theme = Theme::default();
        let mut explorer = Self {
            current_path: path.clone(),
            items: Vec::new(),
            state: ListState::default(),
            theme,
            search_query: None,
            filtered_items: Vec::new(),
            show_breadcrumbs: true,
        };
        explorer.refresh();
        explorer.state.select(Some(0));
        explorer
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme;
    }

    pub fn refresh(&mut self) {
        self.items.clear();

        if let Ok(entries) = std::fs::read_dir(&self.current_path) {
            for entry in entries.flatten() {
                let path = entry.path();
                let name = path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                let is_directory = path.is_dir();
                let size = if !is_directory {
                    entry.metadata().ok().map(|m| m.len())
                } else {
                    None
                };

                let file_type = if is_directory {
                    FileType::Directory
                } else {
                    path.extension()
                        .and_then(|e| e.to_str())
                        .map(FileType::from_extension)
                        .unwrap_or(FileType::Other)
                };

                self.items.push(FileItem {
                    name,
                    path,
                    is_directory,
                    size,
                    file_type,
                });
            }
        }

        self.items.sort_by(|a, b| {
            if a.is_directory && !b.is_directory {
                std::cmp::Ordering::Less
            } else if !a.is_directory && b.is_directory {
                std::cmp::Ordering::Greater
            } else {
                a.name.cmp(&b.name)
            }
        });

        self.apply_filter();
    }

    pub fn select_next(&mut self) {
        let visible_items = self.get_visible_items();
        if let Some(selected) = self.state.selected() {
            if selected < visible_items.len().saturating_sub(1) {
                self.state.select(Some(selected + 1));
            }
        }
    }

    pub fn select_previous(&mut self) {
        if let Some(selected) = self.state.selected() {
            if selected > 0 {
                self.state.select(Some(selected - 1));
            }
        }
    }

    pub fn enter_directory(&mut self) -> Option<PathBuf> {
        let visible_items = self.get_visible_items();
        if let Some(selected) = self.state.selected() {
            if let Some(&item_index) = visible_items.get(selected) {
                if let Some(item) = self.items.get(item_index) {
                    if item.is_directory {
                        let target = item.path.clone();
                        self.current_path = target.clone();
                        self.refresh();
                        self.state.select(Some(0));
                        return Some(target);
                    }
                }
            }
        }
        None
    }

    pub fn go_up(&mut self) {
        if let Some(parent) = self.current_path.parent() {
            self.current_path = parent.to_path_buf();
            self.refresh();
            self.state.select(Some(0));
        }
    }

    pub fn navigate_to(&mut self, path: PathBuf) {
        if path.is_dir() {
            self.current_path = path;
            self.refresh();
            self.state.select(Some(0));
        }
    }

    pub fn get_selected(&self) -> Option<&FileItem> {
        let visible_items = self.get_visible_items();
        self.state
            .selected()
            .and_then(|i| visible_items.get(i))
            .and_then(|&idx| self.items.get(idx))
    }

    pub fn set_search(&mut self, query: Option<String>) {
        self.search_query = query;
        self.apply_filter();
        if !self.get_visible_items().is_empty() {
            self.state.select(Some(0));
        }
    }

    pub fn clear_search(&mut self) {
        self.search_query = None;
        self.apply_filter();
        if !self.get_visible_items().is_empty() {
            self.state.select(Some(0));
        }
    }

    pub fn toggle_breadcrumbs(&mut self) {
        self.show_breadcrumbs = !self.show_breadcrumbs;
    }

    fn apply_filter(&mut self) {
        if let Some(ref query) = self.search_query {
            let query_lower = query.to_lowercase();
            self.filtered_items = self
                .items
                .iter()
                .enumerate()
                .filter(|(_, item)| item.name.to_lowercase().contains(&query_lower))
                .map(|(i, _)| i)
                .collect();
        } else {
            self.filtered_items = (0..self.items.len()).collect();
        }
    }

    fn get_visible_items(&self) -> &[usize] {
        &self.filtered_items
    }

    #[allow(dead_code)]
    fn render_breadcrumbs(&self, area: Rect, frame: &mut Frame) {
        let path_str = self.current_path.display().to_string();
        let components: Vec<&str> = path_str.split(std::path::MAIN_SEPARATOR).collect();

        let mut spans = Vec::new();
        for (i, component) in components.iter().enumerate() {
            if i > 0 {
                spans.push(Span::raw(" > "));
            }
            spans.push(Span::styled(
                *component,
                Style::default().fg(self.theme.palette.primary),
            ));
        }

        let breadcrumbs = Paragraph::new(Line::from(spans))
            .block(Block::default().borders(Borders::ALL).title("Path"))
            .wrap(Wrap { trim: false });

        frame.render_widget(breadcrumbs, area);
    }

    pub fn render(&mut self, frame: &mut Frame, area: Rect) {
        let visible_items = self.get_visible_items();

        let items: Vec<ListItem> = visible_items
            .iter()
            .filter_map(|&idx| self.items.get(idx))
            .map(|item| {
                let icon = if item.is_directory { "📁 " } else { "📄 " };
                let file_color = self.theme.file_color(item.file_type);
                let size = item
                    .size
                    .map(|s| format!(" ({})", format_bytes(s)))
                    .unwrap_or_default();

                ListItem::new(Line::from(vec![
                    Span::raw(icon),
                    Span::styled(&item.name, Style::default().fg(file_color)),
                    Span::raw(size),
                ]))
            })
            .collect();

        let title = if let Some(ref query) = self.search_query {
            format!(
                "Explorer: {} (Search: {})",
                self.current_path.display(),
                query
            )
        } else {
            format!("Explorer: {}", self.current_path.display())
        };

        let list = List::new(items)
            .block(Block::default().borders(Borders::ALL).title(title))
            .highlight_style(self.theme.selected());

        frame.render_stateful_widget(list, area, &mut self.state);
    }
}

fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_explorer_creation() {
        let explorer = FileExplorer::new(PathBuf::from("."));
        assert_eq!(explorer.current_path, PathBuf::from("."));
    }

    #[test]
    fn test_file_type_detection() {
        assert_eq!(FileType::from_extension("rs"), FileType::Code);
        assert_eq!(FileType::from_extension("txt"), FileType::Text);
        assert_eq!(FileType::from_extension("png"), FileType::Image);
    }

    #[test]
    fn test_format_bytes() {
        assert_eq!(format_bytes(500), "500 B");
        assert_eq!(format_bytes(2048), "2.00 KB");
    }
}
