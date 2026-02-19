//! Component inspector for debugging
//! 
//! Provides tools to inspect and debug UI components

use std::collections::HashMap;

/// Component info for inspection
#[derive(Debug, Clone)]
pub struct ComponentInfo {
    pub id: String,
    pub name: String,
    pub props: HashMap<String, String>,
    pub state: HashMap<String, String>,
    pub children: Vec<String>,
}

/// Inspector for debugging components
pub struct ComponentInspector {
    components: HashMap<String, ComponentInfo>,
    selected_id: Option<String>,
}

impl ComponentInspector {
    /// Create a new inspector
    pub fn new() -> Self {
        Self {
            components: HashMap::new(),
            selected_id: None,
        }
    }

    /// Register a component
    pub fn register_component(&mut self, info: ComponentInfo) {
        self.components.insert(info.id.clone(), info);
    }

    /// Select a component
    pub fn select_component(&mut self, id: String) {
        self.selected_id = Some(id);
    }

    /// Get selected component
    pub fn selected_component(&self) -> Option<&ComponentInfo> {
        self.selected_id.as_ref().and_then(|id| self.components.get(id))
    }

    /// Get all component IDs
    pub fn component_ids(&self) -> impl Iterator<Item = &str> {
        self.components.keys().map(|s| s.as_str())
    }

    /// Get component by ID
    pub fn get_component(&self, id: &str) -> Option<&ComponentInfo> {
        self.components.get(id)
    }

    /// Search components by name
    pub fn search(&self, query: &str) -> Vec<&ComponentInfo> {
        self.components
            .values()
            .filter(|c| c.name.to_lowercase().contains(&query.to_lowercase()))
            .collect()
    }
}

impl Default for ComponentInspector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_inspector() {
        let mut inspector = ComponentInspector::new();
        let info = ComponentInfo {
            id: "test".to_string(),
            name: "TestComponent".to_string(),
            props: HashMap::new(),
            state: HashMap::new(),
            children: Vec::new(),
        };
        
        inspector.register_component(info);
        assert!(inspector.get_component("test").is_some());
    }
}
