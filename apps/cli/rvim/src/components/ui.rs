use ratatui::{
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span, Text},
    widgets::{Block, Borders, Paragraph, Wrap},
    Frame,
};

use crate::app::App;
use crate::components::editor::{EditorState, Mode};

#[derive(Clone)]
pub struct UiRenderer {
    theme: Theme,
}

#[derive(Clone)]
pub struct Theme {
    pub background: Color,
    pub foreground: Color,
    pub primary: Color,
    pub secondary: Color,
    pub accent: Color,
    pub error: Color,
    pub warning: Color,
    pub success: Color,
    pub info: Color,
}

impl Default for Theme {
    fn default() -> Self {
        Self {
            background: Color::Rgb(28, 28, 30),
            foreground: Color::Rgb(220, 220, 220),
            primary: Color::Rgb(97, 175, 239),
            secondary: Color::Rgb(152, 195, 121),
            accent: Color::Rgb(224, 108, 117),
            error: Color::Rgb(224, 108, 117),
            warning: Color::Rgb(229, 192, 123),
            success: Color::Rgb(152, 195, 121),
            info: Color::Rgb(97, 175, 239),
        }
    }
}

impl Default for UiRenderer {
    fn default() -> Self {
        Self::new()
    }
}

impl UiRenderer {
    pub fn new() -> Self {
        Self {
            theme: Theme::default(),
        }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme;
    }

    pub fn render(&self, frame: &mut Frame, area: Rect, app: &App) {
        if app.zen_mode {
            self.render_editor(frame, area, &app.components.editor_state);
        } else {
            let size = area;
            let main_chunks = Layout::default()
                .direction(Direction::Vertical)
                .margin(1)
                .constraints([
                    Constraint::Length(3), // Status Bar
                    Constraint::Min(0),    // Content
                    Constraint::Length(2), // Command Bar
                ])
                .split(size);

            // Split content area horizontally for a sidebar
            let content_chunks = Layout::default()
                .direction(Direction::Horizontal)
                .constraints([Constraint::Percentage(20), Constraint::Percentage(80)])
                .split(main_chunks[1]);

            let sidebar_area = content_chunks[0];
            let main_content_area = content_chunks[1];

            // Split the main content area vertically for editor and terminal
            let main_vertical_chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([Constraint::Percentage(70), Constraint::Percentage(30)])
                .split(main_content_area);

            // Render all components
            self.render_status_bar(frame, main_chunks[0], &app.components.editor_state);
            app.components.database_explorer.draw(frame, sidebar_area);
            self.render_editor(frame, main_vertical_chunks[0], &app.components.editor_state);
            app.components
                .terminal
                .render(frame, main_vertical_chunks[1]);
            self.render_command_bar(frame, main_chunks[2], &app.components.editor_state);
        }
    }

    fn render_status_bar(&self, frame: &mut Frame, area: Rect, editor: &EditorState) {
        let mode_text = match editor.mode() {
            Mode::Normal => "NORMAL",
            Mode::Insert => "INSERT",
            Mode::Select => "SELECT",
            Mode::Command => "COMMAND",
        };

        let mode_color = match editor.mode() {
            Mode::Normal => self.theme.primary,
            Mode::Insert => self.theme.secondary,
            Mode::Select => self.theme.accent,
            Mode::Command => self.theme.warning,
        };

        let status_line = vec![
            Span::styled(
                mode_text,
                Style::default()
                    .fg(Color::Black)
                    .bg(mode_color)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw("  "),
            Span::styled(
                format!(
                    "Ln {}, Col {}",
                    editor.cursor_position().1 + 1,
                    editor.cursor_position().0 + 1
                ),
                Style::default().fg(self.theme.foreground),
            ),
        ];

        let block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(self.theme.primary));

        let paragraph = Paragraph::new(Line::from(status_line))
            .block(block)
            .alignment(Alignment::Left);

        frame.render_widget(paragraph, area);
    }

    fn render_editor(&self, frame: &mut Frame, area: Rect, editor: &EditorState) {
        let lines: Vec<Line> = editor
            .content()
            .iter()
            .map(|line: &String| Line::from(line.as_str()))
            .collect();

        let text = Text::from(lines);

        let block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(self.theme.primary));

        let paragraph = Paragraph::new(text).block(block).wrap(Wrap { trim: false });

        frame.render_widget(paragraph, area);
    }

    fn render_command_bar(&self, frame: &mut Frame, area: Rect, editor: &EditorState) {
        let command_text = match editor.mode() {
            Mode::Command => ":",
            _ => "",
        };

        let line = Line::from(vec![Span::styled(
            command_text,
            Style::default()
                .fg(self.theme.primary)
                .add_modifier(Modifier::BOLD),
        )]);

        let block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(self.theme.primary));

        let paragraph = Paragraph::new(line).block(block).alignment(Alignment::Left);

        frame.render_widget(paragraph, area);
    }
}
