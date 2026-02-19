use crossterm::event::KeyEvent;

#[derive(Clone, Debug)]
pub enum Action {
    KeyEvent(KeyEvent),
    // Other editor actions can be added here
}

pub struct MacroService {
    is_recording: bool,
    recorded_actions: Vec<Action>,
}

impl Default for MacroService {
    fn default() -> Self {
        Self::new()
    }
}

impl MacroService {
    pub fn new() -> Self {
        Self {
            is_recording: false,
            recorded_actions: Vec::new(),
        }
    }

    pub fn toggle_recording(&mut self) {
        self.is_recording = !self.is_recording;
        if !self.is_recording {
            self.recorded_actions.clear();
        }
    }

    pub fn record_action(&mut self, action: Action) {
        if self.is_recording {
            self.recorded_actions.push(action);
        }
    }

    pub fn get_playback_actions(&self) -> Vec<Action> {
        self.recorded_actions.clone()
    }
}
