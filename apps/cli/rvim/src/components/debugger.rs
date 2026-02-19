use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct DebuggerComponent {
    // Add state for the debugger UI, e.g., call stack, variables, breakpoints
}

impl DebuggerComponent {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default().title("Debugger").borders(Borders::ALL);
        let paragraph = Paragraph::new("Debugger UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
