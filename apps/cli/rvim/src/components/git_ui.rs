use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct GitUi {
    // Add state for the Git UI, e.g., status, branches, commit history
}

impl GitUi {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default().title("Git").borders(Borders::ALL);
        let paragraph = Paragraph::new("Git UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
