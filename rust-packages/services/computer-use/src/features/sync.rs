//! Feature 10: Cross-Device Sync

use serde::{Deserialize, Serialize};
use crate::types::Action;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device { pub id: String, pub name: String, pub device_type: DeviceType }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceType { Desktop, Mobile, Tablet }

pub struct SyncManager { devices: Vec<Device>, pending: Vec<Action> }

impl SyncManager {
    pub fn new() -> Self { Self { devices: vec![], pending: vec![] } }
    pub fn register(&mut self, d: Device) { self.devices.push(d); }
    pub fn sync(&mut self, actions: Vec<Action>) { self.pending.extend(actions); }
    pub fn pending(&self) -> &[Action] { &self.pending }
}
impl Default for SyncManager { fn default() -> Self { Self::new() } }
