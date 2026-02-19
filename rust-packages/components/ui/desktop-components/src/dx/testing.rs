//! Testing utilities
//! 
//! Provides utilities for testing components

/// Test utilities for components
pub struct TestHarness {
    /// Test context
    pub context: egui::Context,
}

impl TestHarness {
    /// Create a new test harness
    pub fn new() -> Self {
        // In a real implementation, this would create a test context
        Self {
            context: unsafe { std::mem::zeroed() }, // Placeholder
        }
    }

    /// Run a test
    pub fn run_test<F>(&self, test: F)
    where
        F: FnOnce(&egui::Context),
    {
        test(&self.context);
    }
}

/// Component snapshot for testing
#[derive(Debug, Clone)]
pub struct ComponentSnapshot {
    pub id: String,
    pub props: std::collections::HashMap<String, String>,
    pub state: std::collections::HashMap<String, String>,
}

impl ComponentSnapshot {
    /// Create a new snapshot
    pub fn new(id: String) -> Self {
        Self {
            id,
            props: std::collections::HashMap::new(),
            state: std::collections::HashMap::new(),
        }
    }

    /// Add a prop
    pub fn with_prop(mut self, key: String, value: String) -> Self {
        self.props.insert(key, value);
        self
    }

    /// Add state
    pub fn with_state(mut self, key: String, value: String) -> Self {
        self.state.insert(key, value);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snapshot() {
        let snapshot = ComponentSnapshot::new("test".to_string())
            .with_prop("label".to_string(), "Test".to_string())
            .with_state("active".to_string(), "true".to_string());
        
        assert_eq!(snapshot.props.get("label"), Some(&"Test".to_string()));
    }
}
