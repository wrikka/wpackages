use ratatui::{
    layout::Rect,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

#[derive(Default)]
pub struct TaskManagerUi {
    // Add state for the task manager UI, e.g., list of tasks, selected task
}

impl TaskManagerUi {
    pub fn draw(&self, f: &mut Frame, area: Rect) {
        let block = Block::default().title("Task Manager").borders(Borders::ALL);
        let paragraph = Paragraph::new("Task Manager UI placeholder").block(block);
        f.render_widget(paragraph, area);
    }
}
