use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct RefactoringUi {
    // Add state for the refactoring UI, e.g., refactor plan, user input
}

impl RefactoringUi {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default().title("Refactor").borders(Borders::ALL);
        let paragraph = Paragraph::new("Refactoring UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
