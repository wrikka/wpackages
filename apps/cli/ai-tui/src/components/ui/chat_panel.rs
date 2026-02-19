//! Chat Panel for displaying conversation with syntax highlighting and timestamps
//!
//! The ChatPanel displays messages between the user and AI assistant with:
//!
//! - Syntax highlighting for code blocks
//! - Timestamps for each message
//! - Scrollable message history
//! - Auto-scroll to latest message
//! - Message role indicators (User, Assistant, System)
//!
//! # Example
//!
//! ```rust
//! use crate::components::ui::chat_panel::{ChatPanel, MessageRole};
//!
//! let mut panel = ChatPanel::new();
//! panel.add_message(MessageRole::User, "Hello".to_string());
//! panel.add_message(MessageRole::Assistant, "Hi there!".to_string());
//! ```

use crate::components::ui::Theme;
use ratatui::{layout::Rect, Frame};

#[path = "chat_render.rs"]
mod chat_render;
#[path = "chat_syntax.rs"]
mod chat_syntax;
#[path = "chat_types.rs"]
mod chat_types;

pub use chat_types::{ChatMessage, MessageRole};

use chat_render::ChatRenderer;
use chat_syntax::SyntaxHighlighter;

#[derive(Debug, Clone)]
pub struct ChatPanel {
    messages: Vec<ChatMessage>,
    scroll: usize,
    theme: Theme,
    renderer: ChatRenderer,
    show_timestamps: bool,
    auto_scroll: bool,
}

impl ChatPanel {
    pub fn new() -> Self {
        let theme = Theme::default();
        let renderer = ChatRenderer::new(theme.clone());

        Self {
            messages: Vec::new(),
            scroll: 0,
            theme,
            renderer,
            show_timestamps: true,
            auto_scroll: true,
        }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.renderer.set_theme(theme.clone());
        self.theme = theme;
    }

    pub fn set_show_timestamps(&mut self, show: bool) {
        self.show_timestamps = show;
    }

    pub fn set_auto_scroll(&mut self, auto: bool) {
        self.auto_scroll = auto;
    }

    pub fn add_message(&mut self, role: MessageRole, content: String) {
        let is_code = SyntaxHighlighter::detect_code_block(&content);
        self.messages.push(ChatMessage {
            role,
            content,
            timestamp: chrono::Utc::now(),
            is_code,
        });

        if self.auto_scroll {
            self.scroll_to_bottom();
        }
    }

    pub fn clear(&mut self) {
        self.messages.clear();
        self.scroll = 0;
    }

    pub fn scroll_down(&mut self) {
        if self.scroll < self.messages.len().saturating_sub(1) {
            self.scroll += 1;
        }
    }

    pub fn scroll_up(&mut self) {
        if self.scroll > 0 {
            self.scroll -= 1;
        }
    }

    pub fn scroll_to_bottom(&mut self) {
        if !self.messages.is_empty() {
            self.scroll = self.messages.len() - 1;
        }
    }

    pub fn scroll_to_top(&mut self) {
        self.scroll = 0;
    }

    pub fn get_message_count(&self) -> usize {
        self.messages.len()
    }

    pub fn render(&mut self, frame: &mut Frame, area: Rect) {
        self.renderer.render_chat(
            frame,
            area,
            &self.messages,
            self.scroll,
            self.show_timestamps,
        );
    }
}

impl Default for ChatPanel {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chat_panel_creation() {
        let panel = ChatPanel::new();
        assert_eq!(panel.get_message_count(), 0);
    }

    #[test]
    fn test_add_message() {
        let mut panel = ChatPanel::new();
        panel.add_message(MessageRole::User, "Hello".to_string());
        assert_eq!(panel.get_message_count(), 1);
    }

    #[test]
    fn test_message_role_display() {
        assert_eq!(MessageRole::User.display_name(), "User");
        assert_eq!(MessageRole::Assistant.icon(), "🤖");
    }

    #[test]
    fn test_code_detection() {
        assert!(SyntaxHighlighter::detect_code_block(
            "```rust\nfn main() {}\n```"
        ));
        assert!(!SyntaxHighlighter::detect_code_block("Just text"));
    }
}
