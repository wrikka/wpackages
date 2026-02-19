//! Feature 29: Robust Validation System

use crate::types::*;
use anyhow::Result;
use std::collections::HashSet;

/// Feature 29: Robust Validation System
#[derive(Default)]
pub struct ValidationSystem {
    validators: Vec<Validator>,
}

impl ValidationSystem {
    /// Validate actions before execution
    pub fn validate_action(&self, action: &Action) -> Result<ValidationResult> {
        for validator in &self.validators {
            let result = validator.validate(action)?;
            if !result.is_valid {
                return Ok(result);
            }
        }
        Ok(ValidationResult {
            is_valid: true,
            errors: vec![],
        })
    }

    /// Check for consistency
    pub fn check_consistency(&self, actions: &[Action]) -> Result<bool> {
        let mut created_files = HashSet::new();
        let mut deleted_files = HashSet::new();

        for action in actions {
            if action.action == "create_file" {
                if let Some(path) = action.parameters.get(0) {
                    if deleted_files.contains(path) {
                        return Ok(false); // Inconsistent: creating a file that was just deleted
                    }
                    created_files.insert(path.clone());
                }
            } else if action.action == "delete_file" {
                if let Some(path) = action.parameters.get(0) {
                    if created_files.contains(path) {
                        return Ok(false); // Inconsistent: deleting a file that was just created
                    }
                    deleted_files.insert(path.clone());
                }
            }
        }
        Ok(true)
    }

    /// Prevent harmful operations
    pub fn prevent_harmful(&self, action: &Action) -> Result<()> {
        if self.is_harmful(action) {
            return Err(anyhow::anyhow!("Harmful operation prevented"));
        }
        Ok(())
    }

    fn is_harmful(&self, action: &Action) -> bool {
        // Example: Check for potentially destructive operations
        // This is a simplified check. A real system would have more complex rules.
        if action.action == "run_command" {
            if let Some(command) = action.parameters.get(0) {
                let lower_command = command.to_lowercase();
                // Look for dangerous commands
                if lower_command.contains("format") || lower_command.contains("rm -rf /") {
                    return true;
                }
            }
        }
        false
    }
}
