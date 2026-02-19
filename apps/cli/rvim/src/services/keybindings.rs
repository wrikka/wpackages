use crate::components::editor::{EditorState, Mode};
use crate::config::KeyBindingsConfig;
use crate::error::Result;
use crossterm::event::{KeyCode, KeyEvent, KeyModifiers};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum KeyBinding {
    Char(char),
    KeyCode(KeyCode),
    Modifiers(KeyModifiers, KeyCode),
}

impl From<KeyEvent> for KeyBinding {
    fn from(event: KeyEvent) -> Self {
        if event.modifiers.is_empty() {
            match event.code {
                KeyCode::Char(c) => KeyBinding::Char(c),
                code => KeyBinding::KeyCode(code),
            }
        } else {
            KeyBinding::Modifiers(event.modifiers, event.code)
        }
    }
}

pub struct KeyBindings {
    bindings: Vec<(KeyBinding, Action)>,
}

#[derive(Debug, Clone)]
pub enum Action {
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
    MoveWordLeft,
    MoveWordRight,
    MoveLineStart,
    MoveLineEnd,
    MoveFileStart,
    MoveFileEnd,
    InsertMode,
    NormalMode,
    SelectMode,
    CommandMode,
    DeleteChar,
    InsertNewline,
    Save,
    Quit,
    OpenFile,
    NewFile,
    CommandPalette,
    FileExplorer,
    Search,
    Replace,
    Undo,
    Redo,
    Copy,
    Paste,
    Cut,
}

impl Default for KeyBindings {
    fn default() -> Self {
        Self::new()
    }
}

impl KeyBindings {
    pub fn new() -> Self {
        let bindings = vec![
            // Normal mode
            (KeyBinding::Char('k'), Action::MoveUp),
            (KeyBinding::Char('j'), Action::MoveDown),
            (KeyBinding::Char('h'), Action::MoveLeft),
            (KeyBinding::Char('l'), Action::MoveRight),
            (KeyBinding::Char('w'), Action::MoveWordRight),
            (KeyBinding::Char('b'), Action::MoveWordLeft),
            (
                KeyBinding::Modifiers(KeyModifiers::CONTROL, KeyCode::Char('e')),
                Action::MoveLineEnd,
            ),
            (
                KeyBinding::Modifiers(KeyModifiers::CONTROL, KeyCode::Char('a')),
                Action::MoveLineStart,
            ),
            (KeyBinding::Char('g'), Action::MoveFileStart),
            (KeyBinding::Char('G'), Action::MoveFileEnd),
            (KeyBinding::Char('i'), Action::InsertMode),
            (KeyBinding::Char(':'), Action::CommandMode),
            (KeyBinding::Char('x'), Action::DeleteChar),
            (KeyBinding::Char('o'), Action::InsertNewline),
            (
                KeyBinding::Modifiers(KeyModifiers::CONTROL, KeyCode::Char('s')),
                Action::Save,
            ),
            (
                KeyBinding::Modifiers(KeyModifiers::CONTROL, KeyCode::Char('q')),
                Action::Quit,
            ),
            (KeyBinding::Char('p'), Action::CommandPalette),
            (KeyBinding::Char('e'), Action::FileExplorer),
            (KeyBinding::Char('/'), Action::Search),
            (KeyBinding::Char('u'), Action::Undo),
            (
                KeyBinding::Modifiers(KeyModifiers::CONTROL, KeyCode::Char('r')),
                Action::Redo,
            ),
            (KeyBinding::Char('y'), Action::Copy),
            (KeyBinding::Char('p'), Action::Paste),
            (KeyBinding::Char('d'), Action::Cut),
            // Insert mode
            (
                KeyBinding::Modifiers(KeyModifiers::CONTROL, KeyCode::Char('[')),
                Action::NormalMode,
            ),
            (KeyBinding::KeyCode(KeyCode::Esc), Action::NormalMode),
        ];

        Self { bindings }
    }

    pub fn from_config(_config: &KeyBindingsConfig) -> Self {
        // TODO: Parse config to create custom keybindings
        // For now, use default bindings
        Self::new()
    }

    pub fn get_action(&self, key: &KeyBinding, _mode: Mode) -> Option<Action> {
        self.bindings
            .iter()
            .find(|(k, _)| k == key)
            .map(|(_, action)| action.clone())
    }

    pub fn execute_action(&self, action: Action, editor: &mut EditorState) -> Result<()> {
        match action {
            Action::MoveUp => {
                editor.move_up();
                Ok(())
            }
            Action::MoveDown => {
                editor.move_down();
                Ok(())
            }
            Action::MoveLeft => {
                editor.move_left();
                Ok(())
            }
            Action::MoveRight => {
                editor.move_right();
                Ok(())
            }
            Action::MoveWordLeft => {
                editor.move_word_left();
                Ok(())
            }
            Action::MoveWordRight => {
                editor.move_word_right();
                Ok(())
            }
            Action::MoveLineStart => {
                editor.move_line_start();
                Ok(())
            }
            Action::MoveLineEnd => {
                editor.move_line_end();
                Ok(())
            }
            Action::MoveFileStart => {
                editor.move_file_start();
                Ok(())
            }
            Action::MoveFileEnd => {
                editor.move_file_end();
                Ok(())
            }
            Action::InsertMode => {
                editor.set_mode(Mode::Insert);
                Ok(())
            }
            Action::NormalMode => {
                editor.set_mode(Mode::Normal);
                Ok(())
            }
            Action::SelectMode => {
                editor.set_mode(Mode::Select);
                Ok(())
            }
            Action::CommandMode => {
                editor.set_mode(Mode::Command);
                Ok(())
            }
            Action::DeleteChar => editor.delete_char(),
            Action::InsertNewline => editor.insert_newline(),
            _ => Ok(()),
        }
    }
}
