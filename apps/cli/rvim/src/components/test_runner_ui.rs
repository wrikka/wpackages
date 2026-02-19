use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct TestRunnerUi {
    // Add state for the test runner UI, e.g., test results, test output
}

impl TestRunnerUi {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default().title("Test Runner").borders(Borders::ALL);
        let paragraph = Paragraph::new("Test Runner UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
