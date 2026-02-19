//! services/policy_verifier.rs

use crate::services::ToolRegistry;
use crate::types::safety::SafetyRule;
use std::sync::Arc;

/// A service that verifies an agent's components against a set of safety rules.
#[derive(Clone, Default)]
pub struct PolicyVerifier {
    rules: Vec<Arc<dyn SafetyRule>>,
}

impl PolicyVerifier {
    /// Creates a new `PolicyVerifier` with the given set of rules.
    pub fn new(rules: Vec<Arc<dyn SafetyRule>>) -> Self {
        Self { rules }
    }

    /// Verifies the tools in a `ToolRegistry` against all registered safety rules.
    ///
    /// # Returns
    /// A `Result` which is `Ok` if all tools comply, or an `Err` with a list of violations.
    pub fn verify_tools(&self, registry: &ToolRegistry) -> Result<(), Vec<String>> {
        let mut violations = Vec::new();

        for tool in registry.tools.values() {
            let effects = tool.effects();
            for rule in &self.rules {
                if !rule.check(&effects) {
                    violations.push(format!(
                        "Tool '{}' violates safety rule '{}': {}",
                        tool.name(),
                        rule.name(),
                        rule.description()
                    ));
                }
            }
        }

        if violations.is_empty() {
            Ok(())
        } else {
            Err(violations)
        }
    }
}
