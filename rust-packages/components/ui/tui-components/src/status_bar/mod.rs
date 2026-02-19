//! Status bar with mode indicator, key hints, and context info

use crate::theme::Theme;
use crate::types::{AppMode, FocusPanel};
use ratatui::{
    layout::Rect,
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph},
    Frame,
};

pub struct StatusBar {
    mode: AppMode,
    focused_panel: Option<FocusPanel>,
    file_path: Option<String>,
    git_branch: Option<String>,
    line_count: usize,
    column: usize,
    progress: Option<f32>,
    theme: Theme,
    show_key_hints: bool,
}

impl StatusBar {
    pub fn new() -> Self {
        Self {
            mode: AppMode::Normal,
            focused_panel: None,
            file_path: None,
            git_branch: None,
            line_count: 0,
            column: 0,
            progress: None,
            theme: Theme::default(),
            show_key_hints: true,
        }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme;
    }

    pub fn set_mode(&mut self, mode: AppMode) {
        self.mode = mode;
    }

    pub fn set_focused_panel(&mut self, panel: Option<FocusPanel>) {
        self.focused_panel = panel;
    }

    pub fn set_file_path(&mut self, path: Option<String>) {
        self.file_path = path;
    }

    pub fn set_git_branch(&mut self, branch: Option<String>) {
        self.git_branch = branch;
    }

    pub fn set_position(&mut self, line: usize, column: usize) {
        self.line_count = line;
        self.column = column;
    }

    pub fn set_progress(&mut self, progress: Option<f32>) {
        self.progress = progress;
    }

    pub fn set_show_key_hints(&mut self, show: bool) {
        self.show_key_hints = show;
    }

    fn get_mode_style(&self, mode: AppMode) -> Style {
        match mode {
            AppMode::Normal => Style::default().fg(self.theme.palette.success),
            AppMode::Insert => Style::default().fg(self.theme.palette.primary),
            AppMode::Command => Style::default().fg(self.theme.palette.warning),
            AppMode::Search => Style::default().fg(self.theme.palette.secondary),
            AppMode::Plan => Style::default().fg(self.theme.palette.error),
        }
    }

    fn get_key_hints(&self) -> Vec<Span> {
        if !self.show_key_hints {
            return Vec::new();
        }

        let hints = match (self.mode, self.focused_panel) {
            (AppMode::Normal, Some(FocusPanel::FileExplorer)) => vec![
                ("Enter", "Open"),
                ("Backspace", "Up"),
                ("Ctrl+F", "Search"),
                ("Ctrl+P", "Commands"),
            ],
            (AppMode::Normal, Some(FocusPanel::ChatPanel)) => vec![
                ("j/k", "Scroll"),
                ("g/G", "Top/Bottom"),
                ("Ctrl+P", "Commands"),
            ],
            (AppMode::Normal, Some(FocusPanel::OutputDisplay)) => {
                vec![("j/k", "Scroll"), ("1-4", "Filter"), ("c", "Clear")]
            }
            (AppMode::Normal, Some(FocusPanel::InputField)) => {
                vec![("Enter", "Send"), ("Ctrl+P", "Commands")]
            }
            (AppMode::Command, _) => vec![
                ("Enter", "Execute"),
                ("Esc", "Cancel"),
                ("↑/↓", "Navigate"),
                ("Ctrl+P/N", "History"),
            ],
            (AppMode::Insert, _) => vec![("Enter", "Submit"), ("Esc", "Normal")],
            (AppMode::Search, _) => vec![("Enter", "Search"), ("Esc", "Cancel")],
            _ => vec![("?", "Help"), ("q", "Quit"), ("Ctrl+P", "Commands")],
        };

        let mut spans = Vec::new();
        for (i, (key, action)) in hints.iter().enumerate() {
            if i > 0 {
                spans.push(Span::raw(" "));
            }
            spans.push(Span::styled(
                format!("[{}]", key),
                Style::default()
                    .fg(self.theme.palette.primary)
                    .add_modifier(Modifier::BOLD),
            ));
            spans.push(Span::raw(format!(" {} ", action)));
        }

        spans
    }

    pub fn render(&mut self, frame: &mut Frame, area: Rect) {
        let mode_style = self.get_mode_style(self.mode);

        let mut left_spans = vec![
            Span::styled(
                self.mode.to_string(),
                mode_style.add_modifier(Modifier::BOLD),
            ),
            Span::raw(" "),
        ];

        if let Some(panel) = self.focused_panel {
            left_spans.push(Span::styled(
                format!("• {}", panel.name()),
                Style::default().fg(self.theme.palette.on_surface_variant),
            ));
            left_spans.push(Span::raw(" "));
        }

        if let Some(ref path) = self.file_path {
            let display_path = if path.len() > 30 {
                format!("...{}", &path[path.len() - 27..])
            } else {
                path.clone()
            };
            left_spans.push(Span::styled(
                format!("📄 {} ", display_path),
                Style::default().fg(self.theme.palette.on_surface),
            ));
        }

        if let Some(ref branch) = self.git_branch {
            left_spans.push(Span::styled(
                format!("🌿 {} ", branch),
                Style::default().fg(self.theme.palette.success),
            ));
        }

        left_spans.push(Span::raw(format!(
            "Ln {}, Col {} ",
            self.line_count, self.column
        )));

        if let Some(p) = self.progress {
            let percentage = (p * 100.0) as usize;
            let bar_width = 10;
            let filled = (p * bar_width as f32) as usize;
            let bar = "█".repeat(filled) + &"░".repeat(bar_width - filled);
            left_spans.push(Span::styled(
                format!("[{} {}%]", bar, percentage),
                Style::default().fg(self.theme.palette.warning),
            ));
        }

        let key_hints = self.get_key_hints();

        let mut right_spans = Vec::new();
        if !key_hints.is_empty() {
            right_spans.push(Span::styled(
                "Hint: ",
                Style::default()
                    .fg(self.theme.palette.on_surface_variant)
                    .add_modifier(Modifier::ITALIC),
            ));
            right_spans.extend(key_hints);
        }

        let total_left_width: u16 = left_spans.iter().map(|s| s.content.len() as u16).sum();
        let total_right_width: u16 = right_spans.iter().map(|s| s.content.len() as u16).sum();

        let mut final_spans = left_spans;

        if total_left_width + total_right_width + 2 < area.width {
            let padding = area.width - total_left_width - total_right_width - 2;
            final_spans.push(Span::raw(" ".repeat(padding as usize)));
            final_spans.extend(right_spans);
        }

        let line = Line::from(final_spans);
        let paragraph = Paragraph::new(line).block(Block::default().borders(Borders::ALL));

        frame.render_widget(paragraph, area);
    }
}

impl Default for StatusBar {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_bar_creation() {
        let bar = StatusBar::new();
        assert_eq!(bar.mode, AppMode::Normal);
    }

    #[test]
    fn test_mode_style() {
        let bar = StatusBar::new();
        let normal_style = bar.get_mode_style(AppMode::Normal);
        let insert_style = bar.get_mode_style(AppMode::Insert);
        assert_ne!(normal_style.fg, insert_style.fg);
    }

    #[test]
    fn test_set_mode() {
        let mut bar = StatusBar::new();
        bar.set_mode(AppMode::Command);
        assert_eq!(bar.mode, AppMode::Command);
    }

    #[test]
    fn test_file_path_truncation() {
        let mut bar = StatusBar::new();
        bar.set_file_path(Some(
            "/very/long/path/that/should/be/truncated/to/show/briefly.txt".to_string(),
        ));
        assert!(bar.file_path.as_ref().unwrap().starts_with("..."));
    }
}
