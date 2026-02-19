use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct ReplComponent {
    // Add state for the REPL UI, e.g., command history, output
}

impl ReplComponent {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default().title("REPL").borders(Borders::ALL);
        let paragraph = Paragraph::new("REPL UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
