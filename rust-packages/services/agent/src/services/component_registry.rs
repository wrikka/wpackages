//! services/component_registry.rs

use crate::types::dynamic::DynamicComponent;
use std::collections::HashMap;
use std::sync::Arc;

/// A registry for discovering and managing dynamic agent components.
#[derive(Clone, Default)]
pub struct ComponentRegistry {
    components: HashMap<String, Arc<dyn DynamicComponent>>,
}

impl ComponentRegistry {
    /// Creates a new, empty `ComponentRegistry`.
    pub fn new() -> Self {
        Self::default()
    }

    /// Registers a new dynamic component.
    pub fn register(&mut self, name: &str, component: impl DynamicComponent + 'static) {
        self.components.insert(name.to_string(), Arc::new(component));
    }

    /// Retrieves a component by name.
    pub fn get(&self, name: &str) -> Option<Arc<dyn DynamicComponent>> {
        self.components.get(name).cloned()
    }
}
