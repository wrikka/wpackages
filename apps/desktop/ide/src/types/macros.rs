use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct MacroLibrary {
    pub name: String,
    pub macros: Vec<Macro>,
}

impl MacroLibrary {
    pub fn new(name: String) -> Self {
        Self {
            name,
            macros: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Macro {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub keybinding: Option<String>,
    pub actions: Vec<MacroAction>,
}

impl Macro {
    pub fn new(id: String, name: String) -> Self {
        Self {
            id,
            name,
            description: None,
            keybinding: None,
            actions: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub enum MacroAction {
    InsertText { text: String },
    DeleteText { range: (usize, usize, usize, usize) },
    MoveCursor { line: usize, column: usize },
    SelectRange { start_line: usize, start_col: usize, end_line: usize, end_col: usize },
    RunCommand { command: String, args: Vec<String> },
}
