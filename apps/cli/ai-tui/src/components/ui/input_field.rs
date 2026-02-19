//! Input field for user prompts

use ratatui::{
    layout::Rect,
    style::{Color, Style},
    widgets::{Block, Borders},
    Frame,
};
use tui_textarea::{Key, TextArea};

pub struct InputField {
    textarea: TextArea<'static>,
}

impl InputField {
    pub fn new() -> Self {
        let mut textarea = TextArea::default();
        textarea.set_block(Block::default().borders(Borders::ALL).title("Input"));
        textarea.set_placeholder_text("Type your message...");
        textarea
            .set_cursor_line_style(Style::default().add_modifier(ratatui::style::Modifier::BOLD));
        textarea.set_placeholder_style(Style::default().fg(Color::DarkGray));
        Self { textarea }
    }

    pub fn handle_key(&mut self, key: Key) -> bool {
        match key {
            Key::Char(c) => {
                self.textarea.insert_char(c);
                true
            }
            Key::Backspace => {
                self.textarea.delete_char();
                true
            }
            Key::Enter => false,
            Key::Left => true,
            Key::Right => true,
            _ => true,
        }
    }

    pub fn get_text(&self) -> String {
        self.textarea.lines().join("\n")
    }

    pub fn clear(&mut self) {
        self.textarea = TextArea::default();
        self.textarea
            .set_block(Block::default().borders(Borders::ALL).title("Input"));
        self.textarea.set_placeholder_text("Type your message...");
        self.textarea
            .set_cursor_line_style(Style::default().add_modifier(ratatui::style::Modifier::BOLD));
        self.textarea
            .set_placeholder_style(Style::default().fg(Color::DarkGray));
    }

    pub fn render(&mut self, frame: &mut Frame, area: Rect) {
        frame.render_widget(&self.textarea, area);
    }
}

impl Default for InputField {
    fn default() -> Self {
        Self::new()
    }
}
