//! types/energy.rs

use serde::{Deserialize, Serialize};

/// Represents the estimated energy cost of a task, in millijoules.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergyCost {
    pub cost: u32,
}

/// Represents the current power state of the device.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PowerState {
    Charging,
    OnBattery,
    LowPowerMode,
}
