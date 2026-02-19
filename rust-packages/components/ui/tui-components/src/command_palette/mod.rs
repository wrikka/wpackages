//! Command Palette with fuzzy search, categories, and history

use crate::theme::Theme;
use ratatui::{layout::Rect, widgets::ListState, Frame};

mod command_defaults;
mod command_filter;
mod command_fuzzy;
mod command_history;
mod command_render;
mod command_types;

pub use command_types::{Command, CommandCategory, FuzzyMatch};

use command_history::CommandHistory;
use command_render::CommandRenderer;

pub struct CommandPalette {
    input: String,
    commands: Vec<Command>,
    filtered_commands: Vec<(usize, FuzzyMatch)>,
    state: ListState,
    visible: bool,
    theme: Theme,
    renderer: CommandRenderer,
    history: CommandHistory,
    history_index: Option<usize>,
}

impl CommandPalette {
    pub fn new() -> Self {
        let theme = Theme::default();
        let renderer = CommandRenderer::new(theme.clone());

        Self {
            input: String::new(),
            commands: command_defaults::default_commands(),
            filtered_commands: Vec::new(),
            state: ListState::default(),
            visible: false,
            theme,
            renderer,
            history: CommandHistory::default(),
            history_index: None,
        }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme.clone();
        self.renderer.set_theme(theme);
    }

    pub fn show(&mut self) {
        self.visible = true;
        self.input.clear();
        self.history_index = None;
        self.filter_commands();
        self.state.select(Some(0));
    }

    pub fn hide(&mut self) {
        self.visible = false;
        self.history_index = None;
    }

    pub fn is_visible(&self) -> bool {
        self.visible
    }

    pub fn handle_char(&mut self, c: char) {
        self.input.push(c);
        self.history_index = None;
        self.filter_commands();
    }

    pub fn handle_backspace(&mut self) {
        self.input.pop();
        self.history_index = None;
        self.filter_commands();
    }

    pub fn select_next(&mut self) {
        if let Some(selected) = self.state.selected() {
            if selected < self.filtered_commands.len().saturating_sub(1) {
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

    pub fn history_next(&mut self) {
        if !self.history.is_empty() {
            if self.history_index.is_none() {
                self.history_index = self.history.last_index();
            } else if let Some(idx) = self.history_index {
                if idx > 0 {
                    self.history_index = Some(idx - 1);
                }
            }
            self.load_history();
        }
    }

    pub fn history_previous(&mut self) {
        if let Some(idx) = self.history_index {
            if idx < self.history.len() - 1 {
                self.history_index = Some(idx + 1);
                self.load_history();
            }
        } else {
            self.history_index = None;
            self.input.clear();
            self.filter_commands();
        }
    }

    fn load_history(&mut self) {
        if let Some(idx) = self.history_index {
            if let Some(entry) = self.history.get(idx) {
                self.input = entry.clone();
                self.filter_commands();
            }
        }
    }

    pub fn get_selected_command(&self) -> Option<&Command> {
        self.state
            .selected()
            .and_then(|i| self.filtered_commands.get(i))
            .map(|(idx, _)| *idx)
            .and_then(|idx| self.commands.get(idx))
    }

    fn filter_commands(&mut self) {
        self.filtered_commands = command_filter::filter_commands(&self.commands, &self.input);

        if !self.filtered_commands.is_empty() {
            self.state.select(Some(0));
        } else {
            self.state.select(None);
        }
    }

    fn add_to_history(&mut self) {
        self.history.add(self.input.clone());
    }

    pub fn execute_selected(&mut self) -> Option<String> {
        if let Some(cmd) = self.get_selected_command() {
            let id = cmd.id.as_str().to_string();
            self.add_to_history();
            Some(id)
        } else {
            None
        }
    }

    pub fn render(&mut self, frame: &mut Frame, area: Rect) {
        if !self.visible {
            return;
        }

        self.renderer.render_overlay(
            frame,
            area,
            &self.input,
            &self.commands,
            &self.filtered_commands,
            &mut self.state,
        );
    }
}

impl Default for CommandPalette {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_command_palette_creation() {
        let palette = CommandPalette::new();
        assert!(!palette.is_visible());
    }

    #[test]
    fn test_show_hide() {
        let mut palette = CommandPalette::new();
        palette.show();
        assert!(palette.is_visible());
        palette.hide();
        assert!(!palette.is_visible());
    }

    #[test]
    fn test_fuzzy_match() {
        let result = FuzzyMatch::fuzzy_match("of", "open file");
        assert!(result.is_some());
        assert!(result.unwrap().score.value() > 0.0);
    }

    #[test]
    fn test_fuzzy_match_no_match() {
        let result = FuzzyMatch::fuzzy_match("xyz", "open file");
        assert!(result.is_none());
    }

    #[test]
    fn test_category_display() {
        assert_eq!(CommandCategory::File.display_name(), "File");
        assert_eq!(CommandCategory::Git.icon(), "🔀");
    }
}
