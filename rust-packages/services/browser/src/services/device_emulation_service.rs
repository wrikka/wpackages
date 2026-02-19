use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceProfile {
    pub name: String,
    pub user_agent: String,
    pub viewport: Viewport,
    pub device_scale_factor: f64,
    pub is_mobile: bool,
    pub has_touch: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Viewport {
    pub width: u32,
    pub height: u32,
}

impl DeviceProfile {
    pub fn desktop() -> Self {
        Self {
            name: "Desktop".to_string(),
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36".to_string(),
            viewport: Viewport {
                width: 1920,
                height: 1080,
            },
            device_scale_factor: 1.0,
            is_mobile: false,
            has_touch: false,
        }
    }

    pub fn mobile() -> Self {
        Self {
            name: "Mobile".to_string(),
            user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)".to_string(),
            viewport: Viewport {
                width: 375,
                height: 812,
            },
            device_scale_factor: 3.0,
            is_mobile: true,
            has_touch: true,
        }
    }

    pub fn tablet() -> Self {
        Self {
            name: "Tablet".to_string(),
            user_agent: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)".to_string(),
            viewport: Viewport {
                width: 768,
                height: 1024,
            },
            device_scale_factor: 2.0,
            is_mobile: true,
            has_touch: true,
        }
    }
}

#[async_trait]
pub trait DeviceEmulationService: Send + Sync {
    async fn set_profile(&self, session_id: &str, profile: &DeviceProfile) -> Result<()>;
    async fn get_profile(&self, session_id: &str) -> Result<Option<DeviceProfile>>;
    async fn reset(&self, session_id: &str) -> Result<()>;
    async fn list_profiles(&self) -> Result<Vec<DeviceProfile>>;
}
