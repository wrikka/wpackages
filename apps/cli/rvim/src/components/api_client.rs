use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct ApiClientComponent {
    // Add state for the API client UI, e.g., request details, response
}

impl ApiClientComponent {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default().title("API Client").borders(Borders::ALL);
        let paragraph = Paragraph::new("API Client UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
