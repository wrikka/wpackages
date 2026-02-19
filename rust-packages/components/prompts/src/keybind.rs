use crossterm::event::{KeyCode, KeyModifiers};

/// Keybinding configuration
#[derive(Debug, Clone)]
pub struct Keybinding {
    pub key: KeyCode,
    pub modifiers: KeyModifiers,
    pub action: KeyAction,
}

/// Key actions for prompt interactions
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KeyAction {
    Submit,
    Cancel,
    Undo,
    Redo,
    Clear,
    SelectNext,
    SelectPrev,
    SelectFirst,
    SelectLast,
    PageUp,
    PageDown,
    Toggle,
    Help,
    Copy,
    Paste,
    Cut,
    Complete,
    None,
}

/// Keymap for customizing controls
#[derive(Debug, Clone)]
pub struct Keymap {
    bindings: Vec<Keybinding>,
    vim_mode: bool,
    emacs_mode: bool,
}

impl Default for Keymap {
    fn default() -> Self {
        Self::standard()
    }
}

impl Keymap {
    /// Standard keymap
    pub fn standard() -> Self {
        use KeyAction;
        use KeyCode;

        let bindings = vec![
            // Navigation
            Keybinding { key: KeyCode::Enter, modifiers: KeyModifiers::empty(), action: KeyAction::Submit },
            Keybinding { key: KeyCode::Esc, modifiers: KeyModifiers::empty(), action: KeyAction::Cancel },
            Keybinding { key: KeyCode::Char('c'), modifiers: KeyModifiers::CONTROL, action: KeyAction::Cancel },
            Keybinding { key: KeyCode::Char('z'), modifiers: KeyModifiers::CONTROL, action: KeyAction::Undo },
            Keybinding { key: KeyCode::Char('y'), modifiers: KeyModifiers::CONTROL, action: KeyAction::Redo },
            Keybinding { key: KeyCode::Char('u'), modifiers: KeyModifiers::CONTROL, action: KeyAction::Clear },
            
            // List navigation
            Keybinding { key: KeyCode::Down, modifiers: KeyModifiers::empty(), action: KeyAction::SelectNext },
            Keybinding { key: KeyCode::Up, modifiers: KeyModifiers::empty(), action: KeyAction::SelectPrev },
            Keybinding { key: KeyCode::Home, modifiers: KeyModifiers::empty(), action: KeyAction::SelectFirst },
            Keybinding { key: KeyCode::End, modifiers: KeyModifiers::empty(), action: KeyAction::SelectLast },
            Keybinding { key: KeyCode::PageUp, modifiers: KeyModifiers::empty(), action: KeyAction::PageUp },
            Keybinding { key: KeyCode::PageDown, modifiers: KeyModifiers::empty(), action: KeyAction::PageDown },
            Keybinding { key: KeyCode::Char('j'), modifiers: KeyModifiers::empty(), action: KeyAction::SelectNext },
            Keybinding { key: KeyCode::Char('k'), modifiers: KeyModifiers::empty(), action: KeyAction::SelectPrev },
            
            // Actions
            Keybinding { key: KeyCode::Tab, modifiers: KeyModifiers::empty(), action: KeyAction::Toggle },
            Keybinding { key: KeyCode::Char('h'), modifiers: KeyModifiers::CONTROL, action: KeyAction::Help },
            Keybinding { key: KeyCode::Char('c'), modifiers: KeyModifiers::CONTROL | KeyModifiers::SHIFT, action: KeyAction::Copy },
            Keybinding { key: KeyCode::Char('v'), modifiers: KeyModifiers::CONTROL, action: KeyAction::Paste },
            Keybinding { key: KeyCode::Char('x'), modifiers: KeyModifiers::CONTROL, action: KeyAction::Cut },
            Keybinding { key: KeyCode::Tab, modifiers: KeyModifiers::empty(), action: KeyAction::Complete },
        ];

        Self {
            bindings,
            vim_mode: false,
            emacs_mode: false,
        }
    }

    /// Vim-style keymap
    pub fn vim() -> Self {
        let mut map = Self::standard();
        map.vim_mode = true;
        
        // Add vim-specific bindings
        map.bindings.extend(vec![
            Keybinding { key: KeyCode::Char('j'), modifiers: KeyModifiers::empty(), action: KeyAction::SelectNext },
            Keybinding { key: KeyCode::Char('k'), modifiers: KeyModifiers::empty(), action: KeyAction::SelectPrev },
            Keybinding { key: KeyCode::Char('g'), modifiers: KeyModifiers::empty(), action: KeyAction::SelectFirst },
            Keybinding { key: KeyCode::Char('G'), modifiers: KeyModifiers::empty(), action: KeyAction::SelectLast },
            Keybinding { key: KeyCode::Char('q'), modifiers: KeyModifiers::empty(), action: KeyAction::Cancel },
        ]);

        map
    }

    /// Emacs-style keymap
    pub fn emacs() -> Self {
        use KeyAction::*;
        use KeyCode::*;

        let mut map = Self::standard();
        map.emacs_mode = true;
        
        // Add emacs-specific bindings
        map.bindings.extend(vec![
            Keybinding { key: Char('p'), modifiers: KeyModifiers::CONTROL, action: SelectPrev },
            Keybinding { key: Char('n'), modifiers: KeyModifiers::CONTROL, action: SelectNext },
            Keybinding { key: Char('a'), modifiers: KeyModifiers::CONTROL, action: SelectFirst },
            Keybinding { key: Char('e'), modifiers: KeyModifiers::CONTROL, action: SelectLast },
            Keybinding { key: Char('g'), modifiers: KeyModifiers::CONTROL, action: Cancel },
            Keybinding { key: Char('w'), modifiers: KeyModifiers::CONTROL, action: Cut },
            Keybinding { key: Char('y'), modifiers: KeyModifiers::CONTROL, action: Paste },
        ]);

        map
    }

    /// Get action for a key combination
    pub fn get_action(&self, key: KeyCode, modifiers: KeyModifiers) -> KeyAction {
        for binding in &self.bindings {
            if binding.key == key && binding.modifiers == modifiers {
                return binding.action;
            }
        }
        KeyAction::None
    }

    /// Bind a custom key
    pub fn bind(&mut self, key: KeyCode, modifiers: KeyModifiers, action: KeyAction) {
        // Remove existing binding for this key
        self.bindings.retain(|b| !(b.key == key && b.modifiers == modifiers));
        
        self.bindings.push(Keybinding {
            key,
            modifiers,
            action,
        });
    }

    /// Check if vim mode is enabled
    pub fn is_vim(&self) -> bool {
        self.vim_mode
    }

    /// Check if emacs mode is enabled
    pub fn is_emacs(&self) -> bool {
        self.emacs_mode
    }
}
