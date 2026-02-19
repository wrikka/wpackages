use serde::{Deserialize, Serialize};

use super::hotkey_types::*;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct HotkeyConfig {
    pub bindings: Vec<HotkeyBinding>,
    pub contexts: Vec<HotkeyContext>,
    pub allow_overrides: bool,
}

impl Default for HotkeyConfig {
    fn default() -> Self {
        Self {
            bindings: Vec::new(),
            contexts: Vec::new(),
            allow_overrides: false,
        }
    }
}

impl HotkeyConfig {
    pub fn add_binding(&mut self, binding: HotkeyBinding) {
        self.bindings.push(binding);
    }

    pub fn remove_binding(&mut self, hotkey_id: &HotkeyId) {
        self.bindings.retain(|b| b.hotkey.id != *hotkey_id);
    }

    pub fn add_context(&mut self, context: HotkeyContext) {
        self.contexts.push(context);
    }

    pub fn find_conflicts(&self) -> Vec<HotkeyConflict> {
        let mut conflicts = Vec::new();
        for (i, binding1) in self.bindings.iter().enumerate() {
            for binding2 in self.bindings.iter().skip(i + 1) {
                if binding1.hotkey.modifiers == binding2.hotkey.modifiers
                    && binding1.hotkey.key == binding2.hotkey.key
                {
                    conflicts.push(HotkeyConflict {
                        binding1: binding1.clone(),
                        binding2: binding2.clone(),
                        context: binding1.when.clone(),
                    });
                }
            }
        }
        conflicts
    }

    pub fn get_binding_for_hotkey(
        &self,
        modifiers: &[ModifierKey],
        key: &KeyCode,
    ) -> Option<&HotkeyBinding> {
        self.bindings
            .iter()
            .find(|b| b.hotkey.matches(modifiers, key))
    }
}
