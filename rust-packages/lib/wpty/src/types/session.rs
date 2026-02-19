use crate::types::{PtyConfig, TabLayout};
use std::collections::HashMap;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct SessionState {
    pub tabs: HashMap<u32, TabLayout>,
    pub session_configs: HashMap<u32, PtyConfig>,
    pub active_tab_id: u32,
}
