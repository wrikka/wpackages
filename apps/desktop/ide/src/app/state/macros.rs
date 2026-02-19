use crate::types::macros::{MacroLibrary, Macro};

#[derive(Debug, Clone, Default)]
pub struct MacrosState {
    pub libraries: Vec<MacroLibrary>,
    pub active_macro: Option<Macro>,
    pub keybindings: HashMap<String, String>,
}

impl MacrosState {
    pub fn new() -> Self {
        Self {
            libraries: Vec::new(),
            active_macro: None,
            keybindings: HashMap::new(),
        }
    }

    pub fn with_libraries(mut self, libraries: Vec<MacroLibrary>) -> Self {
        self.libraries = libraries;
        self
    }

    pub fn with_active_macro(mut self, macro: Macro) -> Self {
        self.active_macro = Some(macro);
        self
    }

    pub fn with_keybindings(mut self, keybindings: HashMap<String, String>) -> Self {
        self.keybindings = keybindings;
        self
    }

    pub fn add_library(&mut self, library: MacroLibrary) {
        self.libraries.push(library);
    }

    pub fn set_active_macro(&mut self, macro: Macro) {
        self.active_macro = Some(macro);
    }

    pub fn add_keybinding(&mut self, keybinding: String, macro_id: String) {
        self.keybindings.insert(keybinding, macro_id);
    }

    pub fn get_macros(&self) -> Vec<&Macro> {
        let mut macros = Vec::new();

        for library in &self.libraries {
            for macro in &library.macros {
                macros.push(macro);
            }
        }

        macros
    }

    pub fn find_macro_by_keybinding(&self, keybinding: &str) -> Option<&Macro> {
        if let Some(macro_id) = self.keybindings.get(keybinding) {
            self.get_macros()
                .into_iter()
                .find(|m| m.id == macro_id)
        } else {
            None
        }
    }

    pub fn find_macro_by_name(&self, name: &str) -> Option<&Macro> {
        self.get_macros()
            .into_iter()
            .find(|m| m.name == name)
    }

    pub fn library_count(&self) -> usize {
        self.libraries.len()
    }

    pub fn macro_count(&self) -> usize {
        self.get_macros().len()
    }

    pub fn keybinding_count(&self) -> usize {
        self.keybindings.len()
    }
}
