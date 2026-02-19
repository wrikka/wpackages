use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct ProjectScaffoldingComponent {
    // Add state for the project scaffolding UI, e.g., template list, options
}

impl ProjectScaffoldingComponent {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default()
            .title("Project Scaffolding")
            .borders(Borders::ALL);
        let paragraph = Paragraph::new("Project Scaffolding UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
