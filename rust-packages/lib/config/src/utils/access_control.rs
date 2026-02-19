//! Configuration access control
//!
//! This module provides access control for configuration operations.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;
use std::collections::HashMap;

/// Represents access permissions.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Permission {
    Read,
    Write,
    Delete,
    Admin,
}

impl Permission {
    /// Returns whether this permission implies another.
    ///
    /// # Arguments
    ///
    /// * `other` - The permission to check against
    ///
    /// # Returns
    ///
    /// Returns `true` if this permission implies the other.
    pub fn implies(&self, other: Permission) -> bool {
        matches!(
            self,
            other,
            Permission::Read => Permission::Read | Permission::Write | Permission:: Delete | Permission::Admin,
            Permission::Write => Permission::Delete | Permission::Admin,
            Permission::Delete => Permission::Delete,
            Permission::Admin => Permission::Admin,
        )
    }
}

/// Represents a user or entity.
#[derive(Debug, Clone, Eq, Hash)]
pub struct User {
    id: String,
    name: String,
}

impl User {
    /// Creates a new user.
    ///
    /// # Arguments
    ///
    /// * `id` - The user ID
    /// * `name` - The user name
    ///
    /// # Returns
    ///
    /// Returns a new user.
    pub fn new(id: String, name: String) -> Self {
        Self { id, name }
    }

    /// Returns the user ID.
    ///
    /// # Returns
    ///
    /// Returns the ID.
    pub fn id(&self) -> &str {
        &self.id
    }

    /// Returns the user name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn name(&self) -> &str {
        &self.name
    }
}

/// Represents an access control entry.
#[derive(Debug, Clone)]
pub struct AccessControlEntry {
    path: String,
    permissions: Vec<Permission>,
    users: Vec<String>,
}

impl AccessControlEntry {
    /// Creates a new access control entry.
    ///
    /// # Arguments
    ///
    /// * `path` - The configuration path
    /// * `permissions` - The permissions
    /// * `users` - The users with access
    ///
    /// # Returns
    ///
    /// Returns a new entry.
    pub fn new(
        path: String,
        permissions: Vec<Permission>,
        users: Vec<String>,
    ) -> Self {
        Self {
            path,
            permissions,
            users,
        }
    }

    /// Returns the path.
    ///
    /// # Returns
    ///
    /// Returns the path.
    pub fn path(&self) -> &str {
        &self.path
    }

    /// Returns the permissions.
    ///
    /// # Returns
    ///
    /// Returns the permissions.
    pub fn permissions(&self) -> &[Permission] {
        &self.permissions
    }

    /// Returns the users.
    ///
    /// # Returns
    ///
    /// Returns the users.
    pub fn users(&self) -> &[String] {
        &self.users
    }

    /// Checks if a user has a specific permission.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    /// * `permission` - The permission to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the user has the permission.
    pub fn has_permission(&self, user_id: &str, permission: Permission) -> bool {
        self.users.contains(&user_id.to_string())
            && self.permissions.contains(&permission)
    }

    /// Checks if a user has any of the specified permissions.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    /// * `permissions` - The permissions to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the user has any of the permissions.
    pub fn has_any_permission(
        &self,
        user_id: &str,
        permissions: &[Permission],
    ) -> bool {
        if !self.users.contains(&user_id.to_string()) {
            return false;
        }

        permissions
            .iter()
            .any(|p| self.permissions.contains(p))
    }

    /// Checks if a user has all the specified permissions.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    /// * `permissions` - The permissions to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the user has all the permissions.
    pub fn has_all_permissions(
        &self,
        user_id: &str,
        permissions: &[Permission],
    ) -> bool {
        if !self.users.contains(&user_id.to_string()) {
            return false;
        }

        permissions
            .iter()
            .all(|p| self.permissions.contains(p))
    }
}

/// Represents an access control manager.
#[derive(Debug, Clone)]
pub struct AccessControl {
    entries: HashMap<String, AccessControlEntry>,
}

impl AccessControl {
    /// Creates a new access control manager.
    ///
    /// # Returns
    ///
    /// Returns a new manager.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControl;
    ///
    /// let mut ac = AccessControl::new();
    /// ac.add_entry(
    ///     "appearance.theme_id".to_string(),
    ///     vec
![Permission::Read, Permission::Write],
    ///     vec
//! ["user1".to_string()],
    /// );
    /// ```
    pub fn new() -> Self {
        Self {
            entries: HashMap::new(),
        }
    }

    /// Adds an access control entry.
    ///
    /// # Arguments
    ///
    /// * `entry` - The entry to add
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControl;
    /// use config::utils::access_control::AccessControlEntry;
    ///
    /// let mut ac = AccessControl::new();
    /// let entry = AccessControlEntry::new(
    ///     "appearance.theme_id".to_string(),
    ///     vec
//! [Permission::Read, Permission::Write],
    ///     vec
//! ["user1".to_string()],
    /// );
    /// ac.add_entry(entry);
    /// ```
    pub fn add_entry(&mut self, entry: AccessControlEntry) {
        self.entries.insert(entry.path().to_string(), entry);
    }

    /// Gets an access control entry by path.
    ///
    /// # Arguments
    ///
    /// * `path` - The configuration path
    ///
    /// # Returns
    ///
    /// Returns the entry if found.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControl;
    ///
    /// let ac = AccessControl::new();
    /// if let Some(entry) = ac.get_entry("appearance.theme_id") {
    ///     println!("Permissions: {:?}", entry.permissions());
    /// }
    /// ```
    pub fn get_entry(&self, path: &str) -> Option<&AccessControlEntry> {
        self.entries.get(path)
    }

    /// Removes an access control entry.
    ///
    /// # Arguments
    ///
    /// * `path` - The configuration path
    ///
    /// # Returns
    ///
    /// Returns `true` if removed.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::access_control::AccessControl;
    ///
    /// let mut ac = AccessControl::new();
    /// let removed = ac.remove_entry("appearance.theme_id");
    /// assert!(removed);
    /// ```
    pub fn remove_entry(&mut self, path: &str) -> bool {
        self.entries.remove(path).is_some()
    }

    /// Checks if a user has permission to access a path.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    /// * `path` - The configuration path
    /// * `permission` - The permission to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the user has permission.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControl;
    ///
    /// let mut ac = AccessControl::new();
    /// let entry = AccessControlEntry::new(
    ///     "appearance.theme_id".to_string(),
    ///     vec
//! [Permission::Read, Permission::Write],
    ///     vec
//! ["user1".to_string()],
    /// );
    /// ac.add_entry(entry);
    /// assert!(ac.has_permission("user1", "appearance.theme_id", Permission::Read));
    /// ```
    pub fn has_permission(
        &self,
        user_id: &str,
        path: &str,
        permission: Permission,
    ) -> bool {
        if let Some(entry) = self.get_entry(path) {
            entry.has_permission(user_id, permission)
        } else {
            false
        }
    }

    /// Checks if a user has any of the specified permissions for a path.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    /// * `path` - The configuration path
    /// * `permissions` - The permissions to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the user has any of the permissions.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControl;
    ///
    /// let mut ac = AccessControl::new();
    /// let entry = AccessControlEntry::new(
    ///     "appearance.theme_id".to_string(),
    ///     vec
//! [Permission::Read, Permission::Write],
    ///     vec
//! ["user1".to_string()],
    /// );
    /// ac.add_entry(entry);
    /// assert!(ac.has_any_permission("user1", "appearance.theme_id", &[Permission::Read]));
    /// ```
    pub fn has_any_permission(
        &self,
        user_id: &str,
        path: &str,
        permissions: &[Permission],
    ) -> bool {
        if let Some(entry) = self.get_entry(path) {
            entry.has_any_permission(user_id, permissions)
        } else {
            false
        }
    }

    /// Checks if a user has all the specified permissions for a path.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    /// * `path` - The configuration path
    /// * `permissions` - The permissions to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the user has all the permissions.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::control::AccessControl;
    ///
    /// let mut ac = AccessControl::new();
    /// let entry = AccessControlEntry::new(
    ///     "appearance.theme_id".to_string(),
    ///     vec
//! [Permission::Read, Permission::Write],
    ///     vec
//! ["user1".to_string()],
    /// );
    /// ac.add_entry(entry);
    /// assert!(ac.has_all_permissions("user1", "appearance.theme_id", &[Permission::Read, Permission::Write]));
    /// ```
    pub fn has_all_permissions(
        &self,
        user_id: &str,
        path: &str,
        permissions: &[Permission],
    ) -> bool {
        if let Some(entry) = self.get_entry(path) {
            entry.has_all_permissions(user_id, permissions)
        } else {
            false
        }
    }

    /// Lists all entries.
    ///
    /// # Returns
    ///
    /// Returns a list of entry paths.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControl;
    ///
    /// let ac = AccessControl::new();
    /// let paths = ac.list_paths();
    /// for path in paths {
    ///     println!("{}", path);
    /// }
    /// ```
    pub fn list_paths(&self) -> Vec<&str> {
        self.entries.keys().into_iter().map(|s| s.as_str()).collect()
    }

    /// Returns the number of entries.
    ///
    /// # Returns
    ///
    /// Returns the entry count.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Returns `true` if there are no entries.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Clears all entries.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControl;
    ///
    /// let mut ac = AccessControl::new();
    /// ac.clear();
    /// assert!(ac.is_empty());
    /// ```
    pub fn clear(&mut self) {
        self.entries.clear();
    }

    /// Creates default access control entries.
    ///
    /// # Returns
    /// Returns a list of default entries.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::create_default_entries;
    ///
    /// let entries = create_default_entries();
    /// for entry in entries {
    ///     println!("{}: {:?}", entry.path(), entry.permissions());
    /// }
    /// ```
    pub fn create_default_entries() -> Vec<AccessControlEntry> {
        vec![
            AccessControlEntry::new(
                "appearance".to_string(),
                vec
![Permission::Read, Permission::Write],
                vec
//! ["admin".to_string()],
            ),
            AccessControlEntry::new(
                "behavior".to_string(),
                vec
![Permission::Read, Permission::Write],
                vec
//! ["admin".to_string()],
            ),
            AccessControlEntry::new(
                "advanced".to_string(),
                vec
![Permission::Read, Permission::Write],
                vec
//! ["admin".to_string()],
            ),
            AccessControlEntry::new(
                "pty".to_string(),
                vec
![Permission::Read, Permission::Write],
                vec
//! ["admin".to_string()],
            ),
        ]
    }
}

impl Default for AccessControl {
    fn default() -> Self {
        Self::new()
    }
}

/// Checks if a user is an admin.
///
/// # Arguments
///
/// * `user_id` - The user ID
///
/// # Returns
///
/// Returns `true` if the user is an admin.
///
/// # Example
///
/// ```no_run
/// use config::utils::access_control::AccessControl;
///
    /// let ac = AccessControl::new();
/// /// assert!(ac.is_admin("admin"));
/// ```
pub fn is_admin(user_id: &str) -> bool {
    // Check if user has admin permission on any path
    let paths = vec
![
        "appearance".to_string(),
        "behavior".to_string(),
        "advanced".to_string(),
        "pty".to_string(),
    ];

    for path in paths {
        if let Some(entry) = AccessControl::default()
            .get_entry(path)
        {
            if entry.has_permission(user_id, Permission::Admin) {
                return true;
            }
        }
    }

    false
}

/// Creates a default access control manager.
///
/// # Returns
///
/// Returns a new manager with default entries.
///
/// # Example
///
/// ```no_run
/// use config::utils::access_control::create_default_access_control;
///
/// /// let ac = create_default_access_control();
    /// assert!(!ac.is_empty());
    /// ```
pub fn create_default_access_control() -> AccessControl {
    let mut ac = AccessControl::new();

    for entry in create_default_entries() {
        ac.add_entry(entry);
    }

    ac
}

/// Represents an access control policy.
#[derive(Debug, Clone)]
pub struct AccessControlPolicy {
    default_policy: DefaultPolicy,
    admin_users: Vec<String>,
}

/// Represents the default access policy.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum DefaultPolicy {
    AllowAll,
    DenyAll,
    AdminOnly,
}

impl DefaultPolicy {
    /// Returns the default policy.
    ///
    /// # Returns
    ///
    /// Returns the default policy.
    pub fn default() -> Self {
        Self::DenyAll
    }
}

impl AccessControlPolicy {
    /// Creates a new access control policy.
    ///
    /// # Returns
    /// Returns a new policy.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControlPolicy;
    ///
    /// let policy = AccessControlPolicy::new();
    /// assert_eq!(policy.default_policy(), DefaultPolicy::DenyAll);
    /// ```
    pub fn new() -> Self {
        Self {
            default_policy: DefaultPolicy::DenyAll,
            admin_users: vec
![],
        }
    }

    /// Sets the default policy.
    ///
    /// # Arguments
    ///
    /// * `policy` - The default policy
    ///
    /// # Returns
    ///
    /// Returns the policy.
    pub fn with_default_policy(mut self, policy: DefaultPolicy) -> Self {
        self.default_policy = policy;
        self
    }

    /// Adds an admin user.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The admin user ID
    ///
    /// # Returns
    ///
    /// Returns the policy.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControlPolicy;
    ///
    /// let mut policy = AccessControlPolicy::new();
    /// policy = policy.with_admin_user("admin".to_string());
    /// assert!(policy.admin_users().contains(&"admin".to_string()));
    /// ```
    pub fn with_admin_user(mut self, user_id: String) -> Self {
        self.admin_users.push(user_id);
        self
    }

    /// Returns the default policy.
    ///
    /// # Returns
    ///
    /// Returns the policy.
    pub fn default_policy(&self) -> DefaultPolicy {
        self.default_policy
    }

    /// Returns the admin users.
    ///
    /// # Returns
    ///
    /// Returns the admin users.
    pub fn admin_users(&self) -> &[String] {
        &self.admin_users
    }

    /// Checks if a user is an admin.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    ///
    /// # Returns
    ///
    /// Returns `true` if the user is an admin.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControlPolicy;
    ///
    /// let policy = AccessControlPolicy::new();
    /// policy = policy.with_admin_user("admin".to_string());
    /// assert!(policy.is_admin("admin"));
    /// ```
    pub fn is_admin(&self, user_id: &str) -> bool {
        self.admin_users.contains(&user_id.to_string())
    }

    /// Checks if access is allowed based on policy.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The user ID
    /// * `permission` - The permission to check
    ///
    /// # Returns
    /// Returns `true` if access is allowed.
    ///
    /// # Example
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::access_control::AccessControlPolicy;
    ///
    /// let policy = AccessControlPolicy::new();
    /// assert!(!policy.is_allowed("user1", Permission::Read));
    /// policy = policy.with_admin_user("admin".to_string());
    /// assert!(policy.is_allowed("admin", Permission::Admin));
    /// ```
    pub fn is_allowed(&self, user_id: &str, permission: Permission) -> bool {
        match self.default_policy {
            DefaultPolicy::AllowAll => true,
            DefaultPolicy::DenyAll => false,
            DefaultPolicy::AdminOnly => self.is_admin(user_id),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    {
        let config = crate::types::AppConfig::default();
        let key = b"my-signing-key-32-bytes-long-123456";
        let signed = sign_config(&config, key).unwrap();
        let result = verify_config_detailed(&signed, key);
        assert!(result.is_valid());
        assert!(!result.has_errors());
    }

    #[test]
    fn test_verify_config_invalid() {
        let config = crate::types::AppConfig::default();
        let key = b"my-signing-key-32-bytes-long-123456";
        let mut signed = sign_config(&config, key).unwrap();
        signed.signature = vec
![0u8; 32]; // Corrupt signature
        let result = verify_config_detailed(&signed, key);
        assert!(!result.is_valid());
        assert!(result.has_errors());
    }

    #[test]
    fn test_signing_key() {
        let key = SigningKey::new("test".to_string());
        assert_eq!(key.id(), "test");
        assert_eq!(key.key().len(), 32);
    }

    #[test]
    fn test_key_store() {
        let mut store = KeyStore::new();
        let key = SigningKey::new("key1".to_string());
        store.add_key(key);
        assert_eq!(store.len(), 1);
        assert!(store.get_key("key1").is_some());
    }

    #[test]
    fn test_access_control_entry() {
        let entry = AccessControlEntry::new(
            "test".to_string(),
            vec
![Permission::Read, Permission::Write],
            vec
!["user1".to_string()],
        );
        assert_eq!(entry.path(), "test");
        assert!(entry.has_permission("user1", Permission::Read));
        assert!(entry.has_permission("user1", Permission::Write));
    }

    #[test]
    fn test_access_control() {
        let mut ac = AccessControl::new();
        let entry = AccessControlEntry::new(
            "test".to_string(),
            vec
![Permission::Read, Permission::Write],
            vec
!["user1".to_string()],
        );
        ac.add_entry(entry);
        assert_eq!(ac.len(), 1);
        assert!(ac.get_entry("test").is_some());
    }

    #[test]
 fn test_access_control_has_permission() {
        let mut ac = AccessControl::new();
        let entry = AccessControlEntry::new(
            "test".to_string(),
            vec
![Permission::Read, Permission::Write],
            vec
!["user1".to_string()],
        );
        ac.add_entry(entry);
        assert!(ac.has_permission("user1", "test", Permission::Read));
        assert!(!ac.has_permission("user2", "test", Permission::Read));
    }

    #[test]
    fn test_access_control_has_any_permission() {
        let mut ac = AccessControl::new();
        let entry = AccessControlEntry::new(
            "test".to_string(),
            vec
![Permission::Read, Permission::Write],
            vec
!["user1".to_string()],
        );
        ac.add_entry(entry);
        assert!(ac.has_any_permission("user1", "test", &[PermissionRead, PermissionWrite]));
        assert!(!ac.has_any_permission("user2", "test", &[PermissionRead]));
    }

    #[test]
    fn test_access_control_has_all_permissions() {
        let mut ac = AccessControl::new();
        let entry = AccessControlEntry::new(
            "test".to_string(),
            vec
![Permission::Read, Permission::Write],
            vec
!["user1".to_string()],
        );
        ac.add_entry(entry);
        assert!(ac.has_all_permissions("user1", "test", &[PermissionRead, PermissionWrite]));
        assert!(!ac.has_all_permissions("user1", "test", &[Permission::Write]));
    }

    #[test]
    fn test_access_control_list_paths() {
        let mut ac = AccessControl::new();
        let entry = AccessControlEntry::new(
            "test".to_string(),
            vec
![Permission::Read, Permission::Write],
            vec
!["user1".to_string()],
        );
        ac.add_entry(entry);
        assert_eq!(ac.list_paths().len(), 1);
        assert_eq!(ac.list_paths()[0], "test");
    }

    #[test]
    fn test_access_control_is_empty() {
        let ac = AccessControl::new();
        assert!(ac.is_empty());
    }

    #[test]
    fn test_access_control_clear() {
        let mut ac = AccessControl::new();
        let entry = AccessControlEntry::new(
            "test".to_string(),
            vec
![Permission::Read, Permission::Write],
            vec
!["user1".to_string()],
        );
        ac.add_entry(entry);
        assert!(!ac.is_empty());
        ac.clear();
        assert!(ac.is_empty());
    }

    #[test]
    test_create_default_access_control() {
        let ac = create_default_access_control();
        assert!(!ac.is_empty());
    }

    #[test]
    fn test_default_policy() {
        let policy = AccessControlPolicy::new();
        assert_eq!(policy.default_policy(), DefaultPolicy::DenyAll);
    }

    #[test]
    fn test_access_control_policy_with_admin_user() {
        let mut policy = AccessControlPolicy::new();
        policy = policy.with_admin_user("admin".to_string());
        assert!(policy.is_admin("admin"));
    }

    #[test]
    fn test_access_control_policy_is_allowed() {
        let mut policy = AccessControlPolicy::new();
        assert!(!policy.is_allowed("user1", Permission::Read));
        policy = policy.with_admin_user("admin".to_string());
        assert!(policy.is_allowed("admin", Permission::Admin));
    }
}
