//! services/persona_manager.rs

use crate::types::persona::Persona;
use std::collections::HashMap;

/// A service for managing an agent's personas.
#[derive(Clone, Default)]
pub struct PersonaManager {
    personas: HashMap<String, Persona>,
    active_persona: Option<String>,
}

impl PersonaManager {
    pub fn new() -> Self {
        Self::default()
    }

    /// Adds a new persona to the manager.
    pub fn add_persona(&mut self, persona: Persona) {
        self.personas.insert(persona.name.clone(), persona);
    }

    /// Sets the active persona for the agent.
    pub fn set_active_persona(&mut self, name: &str) -> bool {
        if self.personas.contains_key(name) {
            self.active_persona = Some(name.to_string());
            true
        } else {
            false
        }
    }

    /// Gets the currently active persona, if any.
    pub fn get_active_persona(&self) -> Option<&Persona> {
        self.active_persona.as_ref().and_then(|name| self.personas.get(name))
    }
}
