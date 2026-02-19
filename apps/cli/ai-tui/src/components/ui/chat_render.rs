//! Rendering logic for chat panel

use super::chat_syntax::SyntaxHighlighter;
use super::chat_types::{ChatMessage, MessageRole};
use crate::components::ui::Theme;
use ratatui::{
    layout::Rect,
    style::{Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Wrap},
    Frame,
};

#[derive(Debug, Clone)]
pub struct ChatRenderer {
    theme: Theme,
    syntax_highlighter: SyntaxHighlighter,
}

impl ChatRenderer {
    pub fn new(theme: Theme) -> Self {
        let syntax_highlighter = SyntaxHighlighter::new(theme.clone());
        Self {
            theme,
            syntax_highlighter,
        }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme.clone();
        self.syntax_highlighter.set_theme(theme);
    }

    /// Render chat panel
    pub fn render_chat(
        &self,
        frame: &mut Frame,
        area: Rect,
        messages: &[ChatMessage],
        scroll: usize,
        show_timestamps: bool,
    ) {
        let lines: Vec<Line> = messages
            .iter()
            .skip(scroll)
            .flat_map(|msg| {
                let mut lines = Vec::new();

                // Header line with role and timestamp
                let role_style = match msg.role {
                    MessageRole::User => Style::default().fg(self.theme.palette.primary),
                    MessageRole::Assistant => Style::default().fg(self.theme.palette.success),
                    MessageRole::System => Style::default().fg(self.theme.palette.warning),
                };

                let mut header_spans = vec![
                    Span::styled(msg.role.icon(), role_style),
                    Span::raw(" "),
                    Span::styled(
                        msg.role.display_name(),
                        role_style.add_modifier(Modifier::BOLD),
                    ),
                ];

                if show_timestamps {
                    header_spans.push(Span::raw(" "));
                    header_spans.push(Span::styled(
                        self.format_timestamp(&msg.timestamp),
                        Style::default().fg(self.theme.palette.on_surface_variant),
                    ));
                }

                lines.push(Line::from(header_spans));

                // Content lines
                if msg.is_code {
                    lines.extend(self.syntax_highlighter.highlight_code(&msg.content));
                } else {
                    for line in msg.content.lines() {
                        lines.push(Line::from(vec![Span::raw("  "), Span::raw(line)]));
                    }
                }

                // Empty line between messages
                lines.push(Line::from(""));
                lines
            })
            .collect();

        let paragraph = Paragraph::new(lines)
            .block(Block::default().borders(Borders::ALL).title("Chat"))
            .wrap(Wrap { trim: true });

        frame.render_widget(paragraph, area);
    }

    fn format_timestamp(&self, timestamp: &chrono::DateTime<chrono::Utc>) -> String {
        timestamp.format("%H:%M:%S").to_string()
    }
}
