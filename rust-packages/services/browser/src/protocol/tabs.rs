use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TabInfo {
    pub index: usize,
    pub title: String,
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TabsResponse {
    pub tabs: Vec<TabInfo>,
}
