use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct DocViewerUi {
    // Add state for the doc viewer UI, e.g., current documentation content
}

impl DocViewerUi {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default()
            .title("Documentation Viewer")
            .borders(Borders::ALL);
        let paragraph = Paragraph::new("Documentation Viewer UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
