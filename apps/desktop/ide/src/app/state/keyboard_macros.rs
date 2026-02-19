use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MacroAction {
    pub action_type: MacroActionType,
    pub data: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MacroActionType {
    CharInsert,
    CharDelete,
    LineDelete,
    LineInsert,
    CursorMove,
    Selection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyboardMacro {
    pub id: String,
    pub name: String,
    pub actions: Vec<MacroAction>,
    pub created_at: String,
    pub key_binding: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct KeyboardMacrosState {
    pub macros: Vec<KeyboardMacro>,
    pub current_macro: Option<usize>,
    pub is_recording: bool,
    pub recording_actions: Vec<MacroAction>,
    pub playback_speed: PlaybackSpeed,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum PlaybackSpeed {
    Normal,
    Slow,
    Fast,
    Instant,
}

impl KeyboardMacrosState {
    pub fn new() -> Self {
        Self {
            macros: Vec::new(),
            current_macro: None,
            is_recording: false,
            recording_actions: Vec::new(),
            playback_speed: PlaybackSpeed::Normal,
        }
    }

    pub fn start_recording(&mut self) {
        self.is_recording = true;
        self.recording_actions.clear();
    }

    pub fn stop_recording(&mut self, name: String) {
        self.is_recording = false;
        if !self.recording_actions.is_empty() {
            let macro_ = KeyboardMacro {
                id: uuid::Uuid::new_v4().to_string(),
                name,
                actions: self.recording_actions.clone(),
                created_at: chrono::Utc::now().to_rfc3339(),
                key_binding: None,
            };
            self.macros.push(macro_);
        }
        self.recording_actions.clear();
    }

    pub fn record_action(&mut self, action: MacroAction) {
        if self.is_recording {
            self.recording_actions.push(action);
        }
    }

    pub fn play_macro(&mut self, index: usize) -> Option<&KeyboardMacro> {
        if index < self.macros.len() {
            self.current_macro = Some(index);
            Some(&self.macros[index])
        } else {
            None
        }
    }

    pub fn delete_macro(&mut self, index: usize) {
        if index < self.macros.len() {
            self.macros.remove(index);
        }
    }

    pub fn set_key_binding(&mut self, index: usize, binding: String) {
        if index < self.macros.len() {
            self.macros[index].key_binding = Some(binding);
        }
    }
}
