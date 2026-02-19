use anyhow::Result;
use crossterm::event;
use ratatui::backend::Backend;
use std::time::Duration;

mod input;
mod state;
mod ui;

pub use state::{Item, State, AppState};

pub struct App {
    state: State,
}

impl App {
    pub fn new() -> Self {
        let items = vec![
            Item::new(\"Option 1\".to_string()),
            Item::new(\"Option 2\".to_string()),
            Item::new(\"Option 3\".to_string()),
            Item::new(\"Option 4\".to_string()),
            Item::new(\"Option 5\".to_string()),
        ];
        Self {
            state: State::new(items),
        }
    }

    pub fn run<B: Backend>(&mut self, terminal: &mut ratatui::Terminal<B>) -> Result<()> {
        let mut last_tick = std::time::Instant::now();
        let tick_rate = Duration::from_millis(250);

        loop {
            terminal.draw(|f| ui::draw(f, &self.state))?;

            let timeout = tick_rate
                .checked_sub(last_tick.elapsed())
                .unwrap_or_else(|| Duration::from_secs(0));

            if event::poll(timeout)? {
                if input::handle_input(&mut self.state) {
                    break;
                }
            }

            if last_tick.elapsed() >= tick_rate {
                last_tick = std::time::Instant::now();
            }
        }

        Ok(())
    }
}
