//! Terminal event types
//!
//! Types for keyboard, mouse, and terminal events.

use serde::{Deserialize, Serialize};

/// Terminal events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TerminalEvent {
    /// Keyboard event
    Key(KeyEvent),
    /// Terminal resize event
    Resize(u16, u16),
    /// Mouse event
    Mouse(MouseEvent),
}

/// Key event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyEvent {
    /// Key code
    pub code: KeyCode,
    /// Key modifiers (ctrl, alt, shift)
    pub modifiers: KeyModifiers,
}

/// Key codes
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum KeyCode {
    /// Character key
    Char(char),
    /// Enter key
    Enter,
    /// Escape key
    Esc,
    /// Backspace key
    Backspace,
    /// Tab key
    Tab,
    /// Up arrow
    Up,
    /// Down arrow
    Down,
    /// Left arrow
    Left,
    /// Right arrow
    Right,
    /// Home key
    Home,
    /// End key
    End,
    /// Page Up key
    PageUp,
    /// Page Down key
    PageDown,
    /// Delete key
    Delete,
    /// Insert key
    Insert,
    /// Function key (F1-F12)
    F(u8),
}

/// Key modifiers
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct KeyModifiers {
    /// Control key pressed
    pub ctrl: bool,
    /// Alt key pressed
    pub alt: bool,
    /// Shift key pressed
    pub shift: bool,
}

/// Mouse events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MouseEvent {
    /// Mouse button press
    Press(MouseButton, u16, u16),
    /// Mouse button release
    Release(u16, u16),
    /// Mouse drag
    Drag(u16, u16),
    /// Scroll up
    ScrollUp(u16, u16),
    /// Scroll down
    ScrollDown(u16, u16),
}

/// Mouse buttons
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MouseButton {
    /// Left mouse button
    Left,
    /// Right mouse button
    Right,
    /// Middle mouse button
    Middle,
}
