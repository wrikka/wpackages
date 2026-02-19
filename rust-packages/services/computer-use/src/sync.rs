//! Cross-Device Sync
//!
//! Feature 10: Synchronize sessions across devices

use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use crate::error::{Error, Result};
use crate::types::{Action, SessionId};

/// Device information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device {
    pub id: String,
    pub name: String,
    pub device_type: DeviceType,
    pub last_seen: chrono::DateTime<chrono::Utc>,
    pub capabilities: Vec<DeviceCapability>,
}

/// Device type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceType {
    Desktop,
    Laptop,
    Tablet,
    Mobile,
    Server,
}

/// Device capability
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceCapability {
    ScreenCapture,
    MouseControl,
    KeyboardControl,
    TouchInput,
    VoiceInput,
    Camera,
}

/// Sync state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncState {
    pub session_id: String,
    pub version: u64,
    pub last_sync: chrono::DateTime<chrono::Utc>,
    pub pending_actions: Vec<Action>,
    pub checksum: String,
}

/// Sync manager
pub struct SyncManager {
    devices: Arc<RwLock<HashMap<String, Device>>>,
    sessions: Arc<RwLock<HashMap<String, SyncState>>>,
    local_device_id: String,
}

impl SyncManager {
    /// Create new sync manager
    pub fn new(device_name: &str, device_type: DeviceType) -> Self {
        let local_device_id = uuid::Uuid::new_v4().to_string();
        
        let mut devices = HashMap::new();
        devices.insert(local_device_id.clone(), Device {
            id: local_device_id.clone(),
            name: device_name.to_string(),
            device_type,
            last_seen: chrono::Utc::now(),
            capabilities: vec![DeviceCapability::ScreenCapture, DeviceCapability::MouseControl, DeviceCapability::KeyboardControl],
        });

        Self {
            devices: Arc::new(RwLock::new(devices)),
            sessions: Arc::new(RwLock::new(HashMap::new())),
            local_device_id,
        }
    }

    /// Get local device ID
    pub fn local_device_id(&self) -> &str {
        &self.local_device_id
    }

    /// Register a remote device
    pub async fn register_device(&self, device: Device) {
        let mut devices = self.devices.write().await;
        devices.insert(device.id.clone(), device);
    }

    /// Unregister a device
    pub async fn unregister_device(&self, device_id: &str) {
        let mut devices = self.devices.write().await;
        devices.remove(device_id);
    }

    /// List all devices
    pub async fn list_devices(&self) -> Vec<Device> {
        let devices = self.devices.read().await;
        devices.values().cloned().collect()
    }

    /// Create sync session
    pub async fn create_session(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id.to_string(), SyncState {
            session_id: session_id.to_string(),
            version: 0,
            last_sync: chrono::Utc::now(),
            pending_actions: Vec::new(),
            checksum: String::new(),
        });
        Ok(())
    }

    /// Sync actions to session
    pub async fn sync_actions(&self, session_id: &str, actions: Vec<Action>) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        if let Some(state) = sessions.get_mut(session_id) {
            state.pending_actions.extend(actions);
            state.version += 1;
            state.last_sync = chrono::Utc::now();
        }
        Ok(())
    }

    /// Get pending actions
    pub async fn get_pending(&self, session_id: &str) -> Option<Vec<Action>> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).map(|s| s.pending_actions.clone())
    }

    /// Clear pending actions
    pub async fn clear_pending(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        if let Some(state) = sessions.get_mut(session_id) {
            state.pending_actions.clear();
        }
        Ok(())
    }

    /// Get sync state
    pub async fn get_state(&self, session_id: &str) -> Option<SyncState> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_sync_manager() {
        let manager = SyncManager::new("Test Device", DeviceType::Desktop);
        assert!(!manager.local_device_id().is_empty());
    }

    #[tokio::test]
    async fn test_list_devices() {
        let manager = SyncManager::new("Test", DeviceType::Desktop);
        let devices = manager.list_devices().await;
        assert_eq!(devices.len(), 1);
    }

    #[tokio::test]
    async fn test_sync_session() {
        let manager = SyncManager::new("Test", DeviceType::Desktop);
        manager.create_session("test-session").await.unwrap();
        manager.sync_actions("test-session", vec![Action::Snapshot]).await.unwrap();
        
        let pending = manager.get_pending("test-session").await.unwrap();
        assert_eq!(pending.len(), 1);
    }
}
