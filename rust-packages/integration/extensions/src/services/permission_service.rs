use crate::types::{manifest::Permission, ExtensionId};
use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};

/// A thread-safe service for managing and checking extension permissions.
#[derive(Clone, Default)]
pub struct PermissionService {
    inner: Arc<Mutex<ServiceInner>>,
}

#[derive(Default)]
struct ServiceInner {
    granted: HashMap<ExtensionId, HashSet<Permission>>,
}

impl PermissionService {
    pub fn new() -> Self {
        Self::default()
    }

    /// Grants a set of permissions to an extension.
    /// This is typically called when an extension is loaded.
    pub fn grant_permissions(&self, extension_id: &ExtensionId, permissions: &[Permission]) {
        let mut inner = self.inner.lock().unwrap();
        let granted_permissions = permissions.iter().cloned().collect();
        inner
            .granted
            .insert(extension_id.clone(), granted_permissions);
    }

    /// Revokes all permissions from an extension.
    /// This is typically called when an extension is unloaded.
    pub fn revoke_permissions(&self, extension_id: &ExtensionId) {
        let mut inner = self.inner.lock().unwrap();
        inner.granted.remove(extension_id);
    }

    /// Checks if a given extension has the required permission.
    pub fn has_permission(&self, extension_id: &ExtensionId, permission: Permission) -> bool {
        let inner = self.inner.lock().unwrap();
        inner
            .granted
            .get(extension_id)
            .is_some_and(|perms| perms.contains(&permission))
    }
}
