use crate::error::RsuiError;
use std::collections::HashMap;
use std::sync::Arc;

#[cfg(test)]
mod keyboard_shortcuts_service_tests;

/// Keyboard shortcut key
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Key {
    Char(char),
    Enter,
    Escape,
    Tab,
    Backspace,
    Delete,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Home,
    End,
    PageUp,
    PageDown,
    F(u8),
}

impl Key {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "Enter" => Some(Key::Enter),
            "Escape" | "Esc" => Some(Key::Escape),
            "Tab" => Some(Key::Tab),
            "Backspace" => Some(Key::Backspace),
            "Delete" => Some(Key::Delete),
            "ArrowUp" | "Up" => Some(Key::ArrowUp),
            "ArrowDown" | "Down" => Some(Key::ArrowDown),
            "ArrowLeft" | "Left" => Some(Key::ArrowLeft),
            "ArrowRight" | "Right" => Some(Key::ArrowRight),
            "Home" => Some(Key::Home),
            "End" => Some(Key::End),
            "PageUp" => Some(Key::PageUp),
            "PageDown" => Some(Key::PageDown),
            _ => {
                if s.starts_with('F') {
                    s[1..].parse::<u8>().ok().map(Key::F)
                } else if s.len() == 1 {
                    Some(Key::Char(s.chars().next()?))
                } else {
                    None
                }
            }
        }
    }
}

/// Keyboard modifiers
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub struct Modifiers {
    pub ctrl: bool,
    pub alt: bool,
    pub shift: bool,
    pub meta: bool,
}

impl Modifiers {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_ctrl(mut self) -> Self {
        self.ctrl = true;
        self
    }

    pub fn with_alt(mut self) -> Self {
        self.alt = true;
        self
    }

    pub fn with_shift(mut self) -> Self {
        self.shift = true;
        self
    }

    pub fn with_meta(mut self) -> Self {
        self.meta = true;
        self
    }

    pub fn is_empty(&self) -> bool {
        !self.ctrl && !self.alt && !self.shift && !self.meta
    }
}

/// Keyboard shortcut
#[derive(Debug, Clone)]
pub struct Shortcut {
    pub key: Key,
    pub modifiers: Modifiers,
}

impl Shortcut {
    pub fn new(key: Key, modifiers: Modifiers) -> Self {
        Self { key, modifiers }
    }

    pub fn simple(key: Key) -> Self {
        Self {
            key,
            modifiers: Modifiers::new(),
        }
    }

    pub fn ctrl(key: Key) -> Self {
        Self::new(key, Modifiers::new().with_ctrl())
    }

    pub fn alt(key: Key) -> Self {
        Self::new(key, Modifiers::new().with_alt())
    }

    pub fn shift(key: Key) -> Self {
        Self::new(key, Modifiers::new().with_shift())
    }

    pub fn ctrl_alt(key: Key) -> Self {
        Self::new(key, Modifiers::new().with_ctrl().with_alt())
    }

    pub fn ctrl_shift(key: Key) -> Self {
        Self::new(key, Modifiers::new().with_ctrl().with_shift())
    }

    pub fn alt_shift(key: Key) -> Self {
        Self::new(key, Modifiers::new().with_alt().with_shift())
    }

    pub fn ctrl_alt_shift(key: Key) -> Self {
        Self::new(key, Modifiers::new().with_ctrl().with_alt().with_shift())
    }
}

impl std::hash::Hash for Shortcut {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.key.hash(state);
        self.modifiers.ctrl.hash(state);
        self.modifiers.alt.hash(state);
        self.modifiers.shift.hash(state);
        self.modifiers.meta.hash(state);
    }
}

impl PartialEq for Shortcut {
    fn eq(&self, other: &Self) -> bool {
        self.key == other.key
            && self.modifiers.ctrl == other.modifiers.ctrl
            && self.modifiers.alt == other.modifiers.alt
            && self.modifiers.shift == other.modifiers.shift
            && self.modifiers.meta == other.modifiers.meta
    }
}

impl Eq for Shortcut {}

/// Shortcut action
pub type ShortcutAction = Box<dyn Fn() + Send + Sync>;

/// Keyboard shortcuts service trait
pub trait KeyboardShortcutsService {
    fn register_shortcut(&self, shortcut: Shortcut, action: ShortcutAction) -> Result<(), RsuiError>;
    fn unregister_shortcut(&self, shortcut: &Shortcut) -> Result<(), RsuiError>;
    fn trigger_shortcut(&self, shortcut: &Shortcut) -> Result<(), RsuiShortcutError>;
    fn get_shortcut_for_action(&self, action_id: &str) -> Option<Shortcut>;
    fn list_shortcuts(&self) -> Vec<(Shortcut, String)>;
}

/// Keyboard shortcut error
#[derive(Debug, thiserror::Error)]
pub enum RsuiShortcutError {
    #[error("Shortcut not registered: {0}")]
    ShortcutNotFound(String),
    #[error("Action not found: {0}")]
    ActionNotFound(String),
    #[error("Service error: {0}")]
    Service(String),
}

/// Default keyboard shortcuts service implementation
pub struct DefaultKeyboardShortcutsService {
    shortcuts: Arc<std::sync::Mutex<HashMap<Shortcut, ShortcutAction>>>,
    action_map: Arc<std::sync::Mutex<HashMap<String, Shortcut>>>,
}

impl Default for DefaultKeyboardShortcutsService {
    fn default() -> Self {
        Self {
            shortcuts: Arc::new(std::sync::Mutex::new(HashMap::new())),
            action_map: Arc::new(std::sync::Mutex::new(HashMap::new())),
        }
    }
}

impl KeyboardShortcutsService for DefaultKeyboardShortcutsService {
    fn register_shortcut(&self, shortcut: Shortcut, action: ShortcutAction) -> Result<(), RsuiError> {
        let mut shortcuts = self.shortcuts.lock().map_err(|e| RsuiError::State(e.to_string()))?;
        shortcuts.insert(shortcut, action);
        Ok(())
    }

    fn unregister_shortcut(&self, shortcut: &Shortcut) -> Result<(), RsuiError> {
        let mut shortcuts = self.shortcuts.lock().map_err(|e| RsuiError::State(e.to_string()))?;
        shortcuts.remove(shortcut);
        Ok(())
    }

    fn trigger_shortcut(&self, shortcut: &Shortcut) -> Result<(), RsuiShortcutError> {
        let shortcuts = self.shortcuts.lock().map_err(|e| RsuiShortcutError::Service(e.to_string()))?;
        
        if let Some(action) = shortcuts.get(shortcut) {
            action();
            Ok(())
        } else {
            Err(RsuiShortcutError::ShortcutNotFound(format!("{:?}", shortcut)))
        }
    }

    fn get_shortcut_for_action(&self, action_id: &str) -> Option<Shortcut> {
        let action_map = self.action_map.lock().ok()?;
        action_map.get(action_id).cloned()
    }

    fn list_shortcuts(&self) -> Vec<(Shortcut, String)> {
        let Ok(shortcuts) = self.shortcuts.lock() else {
            return Vec::new();
        };
        shortcuts
            .keys()
            .map(|k| (k.clone(), format!("{:?}", k)))
            .collect()
    }
}

impl DefaultKeyboardShortcutsService {
    pub fn register_action(&self, action_id: String, shortcut: Shortcut) -> Result<(), RsuiError> {
        let mut action_map = self.action_map.lock().map_err(|e| RsuiError::State(e.to_string()))?;
        action_map.insert(action_id, shortcut);
        Ok(())
    }
}

/// Common keyboard shortcuts
pub mod common_shortcuts {
    use super::*;

    pub const SAVE: Shortcut = Shortcut {
        key: Key::Char('s'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const OPEN: Shortcut = Shortcut {
        key: Key::Char('o'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const NEW: Shortcut = Shortcut {
        key: Key::Char('n'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const UNDO: Shortcut = Shortcut {
        key: Key::Char('z'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const REDO: Shortcut = Shortcut {
        key: Key::Char('y'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const COPY: Shortcut = Shortcut {
        key: Key::Char('c'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const PASTE: Shortcut = Shortcut {
        key: Key::Char('v'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const CUT: Shortcut = Shortcut {
        key: Key::Char('x'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const SELECT_ALL: Shortcut = Shortcut {
        key: Key::Char('a'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const FIND: Shortcut = Shortcut {
        key: Key::Char('f'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const SEARCH: Shortcut = Shortcut {
        key: Key::Char('k'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const COMMAND_PALETTE: Shortcut = Shortcut {
        key: Key::Char('p'),
        modifiers: Modifiers { ctrl: true, alt: false, shift: false, meta: false },
    };

    pub const ESCAPE: Shortcut = Shortcut {
        key: Key::Escape,
        modifiers: Modifiers { ctrl: false, alt: false, shift: false, meta: false },
    };

    pub const TAB: Shortcut = Shortcut {
        key: Key::Tab,
        modifiers: Modifiers { ctrl: false, alt: false, shift: false, meta: false },
    };

    pub const SHIFT_TAB: Shortcut = Shortcut {
        key: Key::Tab,
        modifiers: Modifiers { ctrl: false, alt: false, shift: true, meta: false },
    };
}
