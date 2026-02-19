use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct GlobalSearchUiComponent {
    // Add state for the global search UI, e.g., search query, results
}

impl GlobalSearchUiComponent {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default()
            .title("Global Search")
            .borders(Borders::ALL);
        let paragraph = Paragraph::new("Global Search UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
