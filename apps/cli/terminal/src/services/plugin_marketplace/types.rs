use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub license: String,
    pub homepage: Option<String>,
    pub repository: Option<String>,
    pub category: PluginCategory,
    pub tags: Vec<String>,
    pub wasm_url: String,
    pub wasm_hash: String,
    pub icon_url: Option<String>,
    pub screenshot_urls: Vec<String>,
    pub permissions: Vec<String>,
    pub dependencies: Vec<String>,
    pub min_terminal_version: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub downloads: u32,
    pub rating: f32,
    pub rating_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PluginCategory {
    Theme,
    Tool,
    Integration,
    Productivity,
    Developer,
    Utility,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginReview {
    pub id: Uuid,
    pub plugin_id: String,
    pub user_id: String,
    pub username: String,
    pub rating: u8,
    pub title: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginStats {
    pub plugin_id: String,
    pub downloads: u32,
    pub active_installs: u32,
    pub rating: f32,
    pub rating_count: u32,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledPlugin {
    pub manifest: PluginManifest,
    pub installed_at: DateTime<Utc>,
    pub enabled: bool,
    pub version: String,
    pub path: PathBuf,
}
