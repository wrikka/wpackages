//! Feature 22: Permission-Based Action Control
//! 
//! Requires approval for sensitive actions,
//! defines permission levels according to risk,
//! audits all actions performed.

use anyhow::Result;
use std::collections::HashSet;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PermissionError {
    #[error("Permission denied")]
    Denied,
    #[error("Invalid permission level")]
    InvalidLevel,
}

/// Permission level
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PermissionLevel {
    None,
    Read,
    Write,
    Admin,
}

/// Permission-based action controller
pub struct PermissionController {
    user_permissions: HashSet<PermissionLevel>,
    action_requirements: std::collections::HashMap<Action, PermissionLevel>,
}

impl PermissionController {
    pub fn new() -> Self {
        let mut controller = Self {
            user_permissions: HashSet::new(),
            action_requirements: std::collections::HashMap::new(),
        };

        // Initialize default action requirements
        controller.initialize_requirements();

        controller
    }

    /// Require approval for sensitive actions
    pub fn require_approval(&self, action: &Action) -> bool {
        let required = self.action_requirements.get(action).unwrap_or(&PermissionLevel::None);
        !self.user_permissions.contains(required)
    }

    /// Define permission levels according to risk
    pub fn define_level(&mut self, action: Action, level: PermissionLevel) {
        self.action_requirements.insert(action, level);
    }

    /// Audit all actions performed
    pub fn audit_action(&self, action: &Action, approved: bool) -> AuditRecord {
        AuditRecord {
            action: action.clone(),
            approved,
            timestamp: std::time::Instant::now(),
        }
    }

    /// Check if user has permission
    pub fn has_permission(&self, level: PermissionLevel) -> bool {
        self.user_permissions.contains(&level)
    }

    /// Grant permission to user
    pub fn grant_permission(&mut self, level: PermissionLevel) {
        self.user_permissions.insert(level);
    }

    /// Initialize default action requirements
    fn initialize_requirements(&mut self) {
        self.action_requirements.insert(Action::Click, PermissionLevel::Read);
        self.action_requirements.insert(Action::Type, PermissionLevel::Write);
        self.action_requirements.insert(Action::Delete, PermissionLevel::Admin);
    }
}

#[derive(Debug, Clone)]
pub enum Action {
    Click,
    Type,
    Delete,
}

#[derive(Debug, Clone)]
pub struct AuditRecord {
    pub action: Action,
    pub approved: bool,
    pub timestamp: std::time::Instant,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_controller() {
        let mut controller = PermissionController::new();
        controller.grant_permission(PermissionLevel::Read);
        assert!(controller.has_permission(PermissionLevel::Read));
    }
}
