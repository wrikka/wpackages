//! Output display with log levels, filtering, and auto-scroll

use crate::components::ui::{TextContext, Theme};
use chrono::{DateTime, Utc};
use ratatui::{
    layout::Rect,
    style::{Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Wrap},
    Frame,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LogLevel {
    Debug,
    Info,
    Warning,
    Error,
}

impl LogLevel {
    pub fn display_name(&self) -> &str {
        match self {
            LogLevel::Debug => "DEBUG",
            LogLevel::Info => "INFO",
            LogLevel::Warning => "WARN",
            LogLevel::Error => "ERROR",
        }
    }

    pub fn icon(&self) -> &str {
        match self {
            LogLevel::Debug => "🔍",
            LogLevel::Info => "ℹ️",
            LogLevel::Warning => "⚠️",
            LogLevel::Error => "❌",
        }
    }

    pub fn text_context(&self) -> TextContext {
        match self {
            LogLevel::Debug => TextContext::Secondary,
            LogLevel::Info => TextContext::Info,
            LogLevel::Warning => TextContext::Warning,
            LogLevel::Error => TextContext::Error,
        }
    }
}

#[derive(Debug, Clone)]
pub struct LogEntry {
    pub level: LogLevel,
    pub message: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct OutputDisplay {
    entries: Vec<LogEntry>,
    scroll: usize,
    theme: Theme,
    filter_level: Option<LogLevel>,
    auto_scroll: bool,
    is_streaming: bool,
}

impl OutputDisplay {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
            scroll: 0,
            theme: Theme::default(),
            filter_level: None,
            auto_scroll: true,
            is_streaming: false,
        }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme;
    }

    pub fn set_filter_level(&mut self, level: Option<LogLevel>) {
        self.filter_level = level;
        self.scroll = 0;
    }

    pub fn set_auto_scroll(&mut self, auto: bool) {
        self.auto_scroll = auto;
    }

    pub fn set_streaming(&mut self, streaming: bool) {
        self.is_streaming = streaming;
    }

    pub fn add_log(&mut self, level: LogLevel, message: String) {
        self.entries.push(LogEntry {
            level,
            message,
            timestamp: Utc::now(),
        });

        if self.auto_scroll {
            self.scroll_to_bottom();
        }
    }

    pub fn set_content(&mut self, content: String) {
        self.entries.clear();
        self.add_log(LogLevel::Info, content);
    }

    pub fn append(&mut self, text: &str) {
        if let Some(last) = self.entries.last_mut() {
            last.message.push_str(text);
        } else {
            self.add_log(LogLevel::Info, text.to_string());
        }
    }

    pub fn clear(&mut self) {
        self.entries.clear();
        self.scroll = 0;
    }

    pub fn scroll_down(&mut self) {
        let visible = self.get_filtered_entries();
        if self.scroll < visible.len().saturating_sub(1) {
            self.scroll += 1;
        }
    }

    pub fn scroll_up(&mut self) {
        if self.scroll > 0 {
            self.scroll -= 1;
        }
    }

    pub fn scroll_to_bottom(&mut self) {
        let visible = self.get_filtered_entries();
        if !visible.is_empty() {
            self.scroll = visible.len() - 1;
        }
    }

    pub fn scroll_to_top(&mut self) {
        self.scroll = 0;
    }

    pub fn get_entry_count(&self) -> usize {
        self.entries.len()
    }

    fn get_filtered_entries(&self) -> Vec<&LogEntry> {
        if let Some(ref filter) = self.filter_level {
            self.entries
                .iter()
                .filter(|entry| self.should_show(entry.level.clone(), filter.clone()))
                .collect()
        } else {
            self.entries.iter().collect()
        }
    }

    fn should_show(&self, entry_level: LogLevel, filter_level: LogLevel) -> bool {
        let entry_priority = self.level_priority(entry_level);
        let filter_priority = self.level_priority(filter_level);
        entry_priority >= filter_priority
    }

    fn level_priority(&self, level: LogLevel) -> u8 {
        match level {
            LogLevel::Debug => 0,
            LogLevel::Info => 1,
            LogLevel::Warning => 2,
            LogLevel::Error => 3,
        }
    }

    fn format_timestamp(&self, timestamp: &DateTime<Utc>) -> String {
        timestamp.format("%H:%M:%S%.3f").to_string()
    }

    pub fn render(&mut self, frame: &mut Frame, area: Rect) {
        let entries = self.get_filtered_entries();

        let title = if self.is_streaming {
            format!("Output (Streaming...) - {} entries", entries.len())
        } else {
            format!(
                "Output - {} entries{}",
                entries.len(),
                if let Some(ref filter) = self.filter_level {
                    format!(" [Filter: {}]", filter.display_name())
                } else {
                    String::new()
                }
            )
        };

        let lines: Vec<Line> = entries
            .iter()
            .skip(self.scroll)
            .flat_map(|entry| {
                let mut lines = Vec::new();

                // Header line with level, icon, and timestamp
                let level_style = self.theme.text(entry.level.text_context());

                let header = Line::from(vec![
                    Span::styled(entry.level.icon(), level_style),
                    Span::raw(" "),
                    Span::styled(
                        entry.level.display_name(),
                        level_style.add_modifier(Modifier::BOLD),
                    ),
                    Span::raw(" "),
                    Span::styled(
                        self.format_timestamp(&entry.timestamp),
                        Style::default().fg(self.theme.palette.on_surface_variant),
                    ),
                ]);

                lines.push(header);

                // Message lines
                for line in entry.message.lines() {
                    lines.push(Line::from(vec![Span::raw("  "), Span::raw(line)]));
                }

                // Empty line between entries
                lines.push(Line::from(""));
                lines
            })
            .collect();

        let paragraph = Paragraph::new(lines)
            .block(Block::default().borders(Borders::ALL).title(title))
            .wrap(Wrap { trim: true });

        frame.render_widget(paragraph, area);
    }
}

impl Default for OutputDisplay {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_output_display_creation() {
        let display = OutputDisplay::new();
        assert_eq!(display.get_entry_count(), 0);
    }

    #[test]
    fn test_add_log() {
        let mut display = OutputDisplay::new();
        display.add_log(LogLevel::Info, "Test message".to_string());
        assert_eq!(display.get_entry_count(), 1);
    }

    #[test]
    fn test_log_level_display() {
        assert_eq!(LogLevel::Error.display_name(), "ERROR");
        assert_eq!(LogLevel::Warning.icon(), "⚠️");
    }

    #[test]
    fn test_level_priority() {
        let display = OutputDisplay::new();
        assert!(display.level_priority(LogLevel::Error) > display.level_priority(LogLevel::Info));
    }

    #[test]
    fn test_filter_level() {
        let mut display = OutputDisplay::new();
        display.add_log(LogLevel::Debug, "Debug".to_string());
        display.add_log(LogLevel::Info, "Info".to_string());
        display.add_log(LogLevel::Error, "Error".to_string());

        display.set_filter_level(Some(LogLevel::Warning));
        let filtered = display.get_filtered_entries();
        assert_eq!(filtered.len(), 1); // Only Error
    }
}
