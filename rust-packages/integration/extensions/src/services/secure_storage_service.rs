use crate::error::{ExtensionError, Result};
use crate::types::ids::ExtensionId;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

// Note: This is a simple in-memory store for demonstration purposes.
// Replace with a real implementation that uses the OS keystore:
// - Windows: DPAPI (Data Protection API) or Windows Credential Manager
// - macOS: Keychain Services
// - Linux: libsecret or GNOME Keyring
// For now, this is a placeholder that would be replaced with actual secure storage
pub struct SecureStorageService {
    // The outer HashMap's key is the ExtensionId.
    // The inner HashMap stores the key-value pairs for that extension.
    store: RwLock<HashMap<ExtensionId, HashMap<String, String>>>,
}

impl SecureStorageService {
    pub fn new() -> Self {
        Self { store: RwLock::new(HashMap::new()) }
    }

    pub fn set(&self, extension_id: &ExtensionId, key: String, value: String) -> Result<()> {
        let mut store = self.store.write().unwrap();
        let extension_store = store.entry(extension_id.clone()).or_insert_with(HashMap::new);
        extension_store.insert(key, value);
        Ok(())
    }

    pub fn get(&self, extension_id: &ExtensionId, key: &str) -> Result<Option<String>> {
        let store = self.store.read().unwrap();
        if let Some(extension_store) = store.get(extension_id) {
            Ok(extension_store.get(key).cloned())
        } else {
            Ok(None)
        }
    }

    pub fn delete(&self, extension_id: &ExtensionId, key: &str) -> Result<bool> {
        let mut store = self.store.write().unwrap();
        if let Some(extension_store) = store.get_mut(extension_id) {
            Ok(extension_store.remove(key).is_some())
        } else {
            Ok(false)
        }
    }
}
