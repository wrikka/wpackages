//! Rendering logic for command palette

use super::command_types::{Command, CommandCategory, FuzzyMatch};
use crate::theme::Theme;
use ratatui::{
    layout::Rect,
    style::Style,
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, Paragraph, Wrap},
    Frame,
};

pub struct CommandRenderer {
    theme: Theme,
}

impl CommandRenderer {
    pub fn new(theme: Theme) -> Self {
        Self { theme }
    }

    pub fn set_theme(&mut self, theme: Theme) {
        self.theme = theme;
    }

    /// Render command palette overlay
    pub fn render_overlay(
        &self,
        frame: &mut Frame,
        area: Rect,
        input: &str,
        commands: &[Command],
        filtered_commands: &[(usize, FuzzyMatch)],
        state: &mut ratatui::widgets::ListState,
    ) {
        // Render input field
        let input_paragraph = Paragraph::new(input).block(
            Block::default()
                .borders(Borders::ALL)
                .title("Command Palette"),
        );

        let input_area = Rect {
            x: area.x,
            y: area.y,
            width: area.width,
            height: 3,
        };

        let list_area = Rect {
            x: area.x,
            y: area.y + 3,
            width: area.width,
            height: area.height - 3,
        };

        frame.render_widget(input_paragraph, input_area);

        // Render command list
        if !filtered_commands.is_empty() {
            let mut current_category: Option<CommandCategory> = None;
            let mut items = Vec::new();

            for (cmd_idx, match_result) in filtered_commands {
                if let Some(cmd) = commands.get(*cmd_idx) {
                    if current_category != Some(cmd.category.clone()) {
                        current_category = Some(cmd.category.clone());
                        items.push(ListItem::new(Line::from(vec![Span::styled(
                            format!("{} {}", cmd.category.icon(), cmd.category.display_name()),
                            Style::default()
                                .fg(self.theme.palette.secondary)
                                .add_modifier(ratatui::style::Modifier::BOLD),
                        )])));
                    }

                    let shortcut = cmd
                        .shortcut
                        .as_ref()
                        .map(|s| format!(" ({})", s.as_str()))
                        .unwrap_or_default();

                    let name_line = match_result.highlight_match(cmd.name.as_str(), &self.theme);
                    let description_line = Line::from(vec![
                        Span::raw("  "),
                        Span::styled(
                            cmd.description.as_str(),
                            Style::default().fg(self.theme.palette.on_surface_variant),
                        ),
                        Span::raw(shortcut),
                    ]);

                    items.push(ListItem::new(vec![name_line, description_line]));
                }
            }

            let list = List::new(items)
                .block(Block::default().borders(Borders::ALL))
                .highlight_style(self.theme.selected());
            frame.render_stateful_widget(list, list_area, state);
        } else {
            let no_results = Paragraph::new("No commands found")
                .block(Block::default().borders(Borders::ALL))
                .style(Style::default().fg(self.theme.palette.on_surface_variant));
            frame.render_widget(no_results, list_area);
        }
    }
}
