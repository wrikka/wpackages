use crossterm::event::{self, Event, KeyCode, KeyEvent, KeyModifiers};
use crate::state::State;

pub fn handle_input(state: &mut State) -> bool {
    if let Event::Key(key) = event::read().unwrap() {
        match key {
            KeyEvent {
                code: KeyCode::Char(c),
                modifiers: KeyModifiers::NONE,
            } => {
                state.filter.push(c);
            }
            KeyEvent {
                code: KeyCode::Backspace,
                ..
            } => {
                state.filter.pop();
            }
            KeyEvent {
                code: KeyCode::Down,
                ..
            } => {
                state.select_next();
            }
            KeyEvent {
                code: KeyCode::Up,
                ..
            } => {
                state.select_previous();
            }
            KeyEvent {
                code: KeyCode::Enter,
                ..
            } => {
                if let Some(item) = state.get_selected_item() {
                    println!(\"Selected: {}\", item.text);
                    state.app_state = crate::state::AppState::Quit;
                }
            }
            KeyEvent {
                code: KeyCode::Esc,
                ..
            } => {
                state.app_state = crate::state::AppState::Quit;
            }
            _ => {}
        }
    }
    matches!(state.app_state, crate::state::AppState::Quit)
}
