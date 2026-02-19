//! Resource usage types

use serde::{Deserialize, Serialize};

/// Memory usage information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryUsage {
    pub total: u64,
    pub used: u64,
    pub free: u64,
}

impl MemoryUsage {
    pub fn new() -> Self {
        Self {
            total: 0,
            used: 0,
            free: 0,
        }
    }

    pub fn with_total(mut self, total: u64) -> Self {
        self.total = total;
        self
    }

    pub fn with_used(mut self, used: u64) -> Self {
        self.used = used;
        self
    }

    pub fn with_free(mut self, free: u64) -> Self {
        self.free = free;
        self
    }

    pub fn usage_percentage(&self) -> f64 {
        if self.total == 0 {
            0.0
        } else {
            (self.used as f64 / self.total as f64) * 100.0
        }
    }
}

/// CPU usage information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuUsage {
    pub user: f64,
    pub system: f64,
    pub idle: f64,
}

impl CpuUsage {
    pub fn new() -> Self {
        Self {
            user: 0.0,
            system: 0.0,
            idle: 100.0,
        }
    }

    pub fn with_user(mut self, user: f64) -> Self {
        self.user = user;
        self
    }

    pub fn with_system(mut self, system: f64) -> Self {
        self.system = system;
        self
    }

    pub fn with_idle(mut self, idle: f64) -> Self {
        self.idle = idle;
        self
    }

    pub fn usage_percentage(&self) -> f64 {
        self.user + self.system
    }
}

impl Default for MemoryUsage {
    fn default() -> Self {
        Self::new()
    }
}

impl Default for CpuUsage {
    fn default() -> Self {
        Self::new()
    }
}
