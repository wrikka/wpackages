use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Style},
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, ListState, Paragraph},
    Frame,
};

use super::state::CommandPalette;

pub fn render(command_palette: &CommandPalette, frame: &mut Frame, area: Rect) {
    if !command_palette.is_visible() {
        return;
    }

    let filtered = command_palette.filtered_commands();

    let items: Vec<ListItem> = filtered
        .iter()
        .enumerate()
        .map(|(i, cmd)| {
            let style = if i == command_palette.selected_index() {
                Style::default().bg(Color::Blue).fg(Color::White)
            } else {
                Style::default()
            };

            ListItem::new(Line::from(vec![
                Span::styled(cmd.name(), style),
                Span::raw(" "),
                Span::styled(
                    format!("({})", cmd.shortcut()),
                    Style::default().fg(Color::DarkGray),
                ),
            ]))
        })
        .collect();

    let mut list_state = ListState::default();
    if !filtered.is_empty() {
        list_state.select(Some(command_palette.selected_index()));
    }

    // Input area
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Length(3), Constraint::Min(0)])
        .split(area);

    let input_text = Line::from(vec![
        Span::styled("> ", Style::default().fg(Color::Green)),
        Span::styled(command_palette.filter(), Style::default()),
    ]);

    let input_paragraph = Paragraph::new(input_text).block(Block::default().borders(Borders::ALL));

    frame.render_widget(input_paragraph, chunks[0]);

    // Command list
    let block = Block::default()
        .title("Command Palette")
        .borders(Borders::ALL);

    let list = List::new(items)
        .block(block)
        .highlight_style(Style::default().add_modifier(ratatui::style::Modifier::BOLD));

    frame.render_stateful_widget(list, chunks[1], &mut list_state);
}
