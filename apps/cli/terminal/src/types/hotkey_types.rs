use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq, Hash)]
pub struct HotkeyId(pub String);

impl HotkeyId {
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4().to_string())
    }

    pub fn from_string(id: String) -> Self {
        Self(id)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Default for HotkeyId {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum ModifierKey {
    Control,
    Alt,
    Shift,
    Meta,
    Super,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum KeyCode {
    KeyA,
    KeyB,
    KeyC,
    KeyD,
    KeyE,
    KeyF,
    KeyG,
    KeyH,
    KeyI,
    KeyJ,
    KeyK,
    KeyL,
    KeyM,
    KeyN,
    KeyO,
    KeyP,
    KeyQ,
    KeyR,
    KeyS,
    KeyT,
    KeyU,
    KeyV,
    KeyW,
    KeyX,
    KeyY,
    KeyZ,
    Digit0,
    Digit1,
    Digit2,
    Digit3,
    Digit4,
    Digit5,
    Digit6,
    Digit7,
    Digit8,
    Digit9,
    F1,
    F2,
    F3,
    F4,
    F5,
    F6,
    F7,
    F8,
    F9,
    F10,
    F11,
    F12,
    Enter,
    Escape,
    Tab,
    Space,
    Backspace,
    Delete,
    Insert,
    Home,
    End,
    PageUp,
    PageDown,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Other(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Hotkey {
    pub id: HotkeyId,
    pub modifiers: Vec<ModifierKey>,
    pub key: KeyCode,
    pub description: String,
    pub action: String,
    pub context: Option<String>,
    pub enabled: bool,
}

impl Hotkey {
    pub fn new(modifiers: Vec<ModifierKey>, key: KeyCode, action: String) -> Self {
        Self {
            id: HotkeyId::new(),
            modifiers,
            key,
            description: String::new(),
            action,
            context: None,
            enabled: true,
        }
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = description;
        self
    }

    pub fn with_context(mut self, context: String) -> Self {
        self.context = Some(context);
        self
    }

    pub fn with_id(mut self, id: HotkeyId) -> Self {
        self.id = id;
        self
    }

    pub fn to_string(&self) -> String {
        let mut parts = Vec::new();
        for modifier in &self.modifiers {
            parts.push(
                match modifier {
                    ModifierKey::Control => "Ctrl",
                    ModifierKey::Alt => "Alt",
                    ModifierKey::Shift => "Shift",
                    ModifierKey::Meta => "Meta",
                    ModifierKey::Super => "Super",
                }
                .to_string(),
            );
        }
        parts.push(match &self.key {
            KeyCode::KeyA => "A",
            KeyCode::KeyB => "B",
            KeyCode::KeyC => "C",
            KeyCode::KeyD => "D",
            KeyCode::KeyE => "E",
            KeyCode::KeyF => "F",
            KeyCode::KeyG => "G",
            KeyCode::KeyH => "H",
            KeyCode::KeyI => "I",
            KeyCode::KeyJ => "J",
            KeyCode::KeyK => "K",
            KeyCode::KeyL => "L",
            KeyCode::KeyM => "M",
            KeyCode::KeyN => "N",
            KeyCode::KeyO => "O",
            KeyCode::KeyP => "P",
            KeyCode::KeyQ => "Q",
            KeyCode::KeyR => "R",
            KeyCode::KeyS => "S",
            KeyCode::KeyT => "T",
            KeyCode::KeyU => "U",
            KeyCode::KeyV => "V",
            KeyCode::KeyW => "W",
            KeyCode::KeyX => "X",
            KeyCode::KeyY => "Y",
            KeyCode::KeyZ => "Z",
            KeyCode::Digit0 => "0",
            KeyCode::Digit1 => "1",
            KeyCode::Digit2 => "2",
            KeyCode::Digit3 => "3",
            KeyCode::Digit4 => "4",
            KeyCode::Digit5 => "5",
            KeyCode::Digit6 => "6",
            KeyCode::Digit7 => "7",
            KeyCode::Digit8 => "8",
            KeyCode::Digit9 => "9",
            KeyCode::F1 => "F1",
            KeyCode::F2 => "F2",
            KeyCode::F3 => "F3",
            KeyCode::F4 => "F4",
            KeyCode::F5 => "F5",
            KeyCode::F6 => "F6",
            KeyCode::F7 => "F7",
            KeyCode::F8 => "F8",
            KeyCode::F9 => "F9",
            KeyCode::F10 => "F10",
            KeyCode::F11 => "F11",
            KeyCode::F12 => "F12",
            KeyCode::Enter => "Enter",
            KeyCode::Escape => "Escape",
            KeyCode::Tab => "Tab",
            KeyCode::Space => "Space",
            KeyCode::Backspace => "Backspace",
            KeyCode::Delete => "Delete",
            KeyCode::Insert => "Insert",
            KeyCode::Home => "Home",
            KeyCode::End => "End",
            KeyCode::PageUp => "PageUp",
            KeyCode::PageDown => "PageDown",
            KeyCode::ArrowUp => "ArrowUp",
            KeyCode::ArrowDown => "ArrowDown",
            KeyCode::ArrowLeft => "ArrowLeft",
            KeyCode::ArrowRight => "ArrowRight",
            KeyCode::Other(s) => s,
        });
        parts.join("+")
    }

    pub fn matches(&self, modifiers: &[ModifierKey], key: &KeyCode) -> bool {
        self.modifiers == modifiers && &self.key == key
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct HotkeyBinding {
    pub hotkey: Hotkey,
    pub command: String,
    pub when: Option<String>,
}

impl HotkeyBinding {
    pub fn new(hotkey: Hotkey, command: String) -> Self {
        Self {
            hotkey,
            command,
            when: None,
        }
    }

    pub fn with_when(mut self, when: String) -> Self {
        self.when = Some(when);
        self
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct HotkeyContext {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub priority: i32,
}

impl HotkeyContext {
    pub fn new(id: String, name: String) -> Self {
        Self {
            id,
            name,
            description: None,
            priority: 0,
        }
    }

    pub fn with_priority(mut self, priority: i32) -> Self {
        self.priority = priority;
        self
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct HotkeyConflict {
    pub binding1: HotkeyBinding,
    pub binding2: HotkeyBinding,
    pub context: Option<String>,
}
