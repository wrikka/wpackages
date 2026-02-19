//! Permission-Based Actions (Feature 9)
//!
//! Granular permissions for automation actions based on roles

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Permission levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum PermissionLevel {
    None,
    ReadOnly,
    ClickOnly,
    Standard,
    Elevated,
    Admin,
}

/// Types of actions that can be permissioned
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ActionType {
    ReadScreen,
    ReadText,
    Click,
    Type,
    Scroll,
    Drag,
    Screenshot,
    LaunchApp,
    KillProcess,
    FileOperation,
    NetworkAccess,
    SystemCommand,
    ClipboardRead,
    ClipboardWrite,
    WindowManagement,
    UiAutomation,
    Custom(String),
}

/// Permission rule for specific context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionRule {
    pub action_type: ActionType,
    pub allowed: bool,
    pub conditions: Vec<PermissionCondition>,
    pub require_approval: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PermissionCondition {
    AppInList(Vec<String>),
    WindowTitleMatches(String),
    WithinWorkHours,
    UserPresent,
    NoSensitiveData,
    MaxFrequency(u32),
}

/// Role definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub name: String,
    pub description: String,
    pub level: PermissionLevel,
    pub permissions: Vec<PermissionRule>,
    pub restrictions: Vec<Restriction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Restriction {
    pub action_type: ActionType,
    pub reason: String,
}

/// Permission check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionCheck {
    pub allowed: bool,
    pub reason: Option<String>,
    pub require_confirmation: bool,
    pub elevated_permission_needed: Option<PermissionLevel>,
}

/// Permission manager
pub struct PermissionManager {
    roles: HashMap<String, Role>,
    user_assignments: HashMap<String, String>, // user -> role
    audit_log: Vec<PermissionAuditEntry>,
    active_session: Option<SessionPermissions>,
}

#[derive(Debug, Clone)]
struct SessionPermissions {
    user: String,
    role: String,
    elevated_until: Option<std::time::Instant>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionAuditEntry {
    pub timestamp: u64,
    pub user: String,
    pub action: ActionType,
    pub target: String,
    pub allowed: bool,
    pub reason: String,
}

impl PermissionManager {
    pub fn new() -> Self {
        let mut roles = HashMap::new();

        // Define default roles
        roles.insert("readonly".to_string(), Self::create_readonly_role());
        roles.insert("standard".to_string(), Self::create_standard_role());
        roles.insert("admin".to_string(), Self::create_admin_role());
        roles.insert("guest".to_string(), Self::create_guest_role());

        Self {
            roles,
            user_assignments: HashMap::new(),
            audit_log: Vec::new(),
            active_session: None,
        }
    }

    /// Check if action is permitted
    pub fn check_permission(&mut self, action: &ActionType, target: &str) -> PermissionCheck {
        let session = match &self.active_session {
            Some(s) => s.clone(),
            None => {
                return PermissionCheck {
                    allowed: false,
                    reason: Some("No active session".to_string()),
                    require_confirmation: false,
                    elevated_permission_needed: None,
                };
            }
        };

        let role = match self.roles.get(&session.role) {
            Some(r) => r.clone(),
            None => {
                return PermissionCheck {
                    allowed: false,
                    reason: Some("Role not found".to_string()),
                    require_confirmation: false,
                    elevated_permission_needed: None,
                };
            }
        };

        // Check restrictions first
        for restriction in &role.restrictions {
            if &restriction.action_type == action {
                self.audit(&session.user, action, target, false, &restriction.reason);
                return PermissionCheck {
                    allowed: false,
                    reason: Some(restriction.reason.clone()),
                    require_confirmation: false,
                    elevated_permission_needed: Some(PermissionLevel::Elevated),
                };
            }
        }

        // Check permissions
        for rule in &role.permissions {
            if &rule.action_type == action {
                let conditions_met = rule.conditions.iter().all(|c| self.check_condition(c));

                if rule.allowed && conditions_met {
                    self.audit(&session.user, action, target, true, "Permission granted");
                    return PermissionCheck {
                        allowed: true,
                        reason: None,
                        require_confirmation: rule.require_approval,
                        elevated_permission_needed: None,
                    };
                }
            }
        }

        // Default deny
        let reason = format!("Action {:?} not permitted for role {}", action, role.name);
        self.audit(&session.user, action, target, false, &reason);

        PermissionCheck {
            allowed: false,
            reason: Some(reason),
            require_confirmation: false,
            elevated_permission_needed: Some(PermissionLevel::Elevated),
        }
    }

    /// Start session with role
    pub fn start_session(&mut self, user: &str, role: &str) -> Result<()> {
        if !self.roles.contains_key(role) {
            anyhow::bail!("Role '{}' not found", role);
        }

        self.active_session = Some(SessionPermissions {
            user: user.to_string(),
            role: role.to_string(),
            elevated_until: None,
        });

        Ok(())
    }

    /// End current session
    pub fn end_session(&mut self) {
        self.active_session = None;
    }

    /// Elevate permissions temporarily
    pub fn elevate(&mut self, duration: std::time::Duration) -> Result<()> {
        let session = self.active_session.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active session"))?;

        session.elevated_until = Some(std::time::Instant::now() + duration);
        Ok(())
    }

    /// Create custom role
    pub fn create_role(&mut self, role: Role) -> Result<()> {
        if self.roles.contains_key(&role.name) {
            anyhow::bail!("Role '{}' already exists", role.name);
        }

        self.roles.insert(role.name.clone(), role);
        Ok(())
    }

    /// Assign role to user
    pub fn assign_role(&mut self, user: &str, role: &str) -> Result<()> {
        if !self.roles.contains_key(role) {
            anyhow::bail!("Role '{}' not found", role);
        }

        self.user_assignments.insert(user.to_string(), role.to_string());
        Ok(())
    }

    /// Get audit log
    pub fn get_audit_log(&self) -> &[PermissionAuditEntry] {
        &self.audit_log
    }

    /// Check if action requires confirmation
    pub fn requires_confirmation(&self, action: &ActionType) -> bool {
        let session = match &self.active_session {
            Some(s) => s,
            None => return true,
        };

        let role = match self.roles.get(&session.role) {
            Some(r) => r,
            None => return true,
        };

        role.permissions
            .iter()
            .filter(|p| &p.action_type == action)
            .any(|p| p.require_approval)
    }

    fn check_condition(&self, condition: &PermissionCondition) -> bool {
        match condition {
            PermissionCondition::WithinWorkHours => {
                // Check if current time is within work hours
                true
            }
            PermissionCondition::UserPresent => {
                // Check if user is present
                true
            }
            PermissionCondition::NoSensitiveData => {
                // Check for sensitive data
                true
            }
            PermissionCondition::MaxFrequency(_) => {
                // Check frequency limits
                true
            }
            _ => true,
        }
    }

    fn audit(&mut self, user: &str, action: &ActionType, target: &str, allowed: bool, reason: &str) {
        let entry = PermissionAuditEntry {
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            user: user.to_string(),
            action: action.clone(),
            target: target.to_string(),
            allowed,
            reason: reason.to_string(),
        };
        self.audit_log.push(entry);
    }

    fn create_readonly_role() -> Role {
        Role {
            name: "readonly".to_string(),
            description: "Can only read screen and text".to_string(),
            level: PermissionLevel::ReadOnly,
            permissions: vec![
                PermissionRule {
                    action_type: ActionType::ReadScreen,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::ReadText,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::Screenshot,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
            ],
            restrictions: vec![
                Restriction {
                    action_type: ActionType::Click,
                    reason: "Read-only role cannot click".to_string(),
                },
                Restriction {
                    action_type: ActionType::Type,
                    reason: "Read-only role cannot type".to_string(),
                },
            ],
        }
    }

    fn create_standard_role() -> Role {
        Role {
            name: "standard".to_string(),
            description: "Standard automation permissions".to_string(),
            level: PermissionLevel::Standard,
            permissions: vec![
                PermissionRule {
                    action_type: ActionType::ReadScreen,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::Click,
                    allowed: true,
                    conditions: vec![PermissionCondition::MaxFrequency(100)],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::Type,
                    allowed: true,
                    conditions: vec![PermissionCondition::MaxFrequency(1000)],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::LaunchApp,
                    allowed: true,
                    conditions: vec![PermissionCondition::AppInList(vec![
                        "notepad".to_string(),
                        "calculator".to_string(),
                    ])],
                    require_approval: true,
                },
            ],
            restrictions: vec![
                Restriction {
                    action_type: ActionType::KillProcess,
                    reason: "Requires elevated permissions".to_string(),
                },
                Restriction {
                    action_type: ActionType::SystemCommand,
                    reason: "Requires elevated permissions".to_string(),
                },
            ],
        }
    }

    fn create_admin_role() -> Role {
        Role {
            name: "admin".to_string(),
            description: "Full automation control".to_string(),
            level: PermissionLevel::Admin,
            permissions: vec![
                PermissionRule {
                    action_type: ActionType::ReadScreen,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::Click,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::Type,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::KillProcess,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
                PermissionRule {
                    action_type: ActionType::SystemCommand,
                    allowed: true,
                    conditions: vec![],
                    require_approval: false,
                },
            ],
            restrictions: vec![],
        }
    }

    fn create_guest_role() -> Role {
        Role {
            name: "guest".to_string(),
            description: "Limited permissions for guests".to_string(),
            level: PermissionLevel::None,
            permissions: vec![
                PermissionRule {
                    action_type: ActionType::ReadScreen,
                    allowed: true,
                    conditions: vec![PermissionCondition::UserPresent],
                    require_approval: true,
                },
            ],
            restrictions: vec![
                Restriction {
                    action_type: ActionType::Click,
                    reason: "Guest cannot interact with UI".to_string(),
                },
                Restriction {
                    action_type: ActionType::Type,
                    reason: "Guest cannot input text".to_string(),
                },
                Restriction {
                    action_type: ActionType::LaunchApp,
                    reason: "Guest cannot launch apps".to_string(),
                },
            ],
        }
    }
}
