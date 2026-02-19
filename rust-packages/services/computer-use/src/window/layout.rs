//! Window Layout Manager
//!
//! Auto-arrange windows to predefined layouts.

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Window layout manager
pub struct WindowLayoutManager {
    layouts: Arc<Mutex<HashMap<String, WindowLayout>>>,
    active_layout: Arc<Mutex<Option<String>>>,
    window_positions: Arc<Mutex<HashMap<u64, WindowPosition>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowLayout {
    pub id: String,
    pub name: String,
    pub description: String,
    pub screen_id: u32,
    pub zones: Vec<Zone>,
    pub rules: Vec<WindowRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Zone {
    pub id: String,
    pub name: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub padding: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowRule {
    pub app_name_pattern: String,
    pub window_title_pattern: Option<String>,
    pub target_zone: String,
    pub priority: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPosition {
    pub window_id: u64,
    pub app_name: String,
    pub window_title: String,
    pub zone_id: Option<String>,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_maximized: bool,
    pub is_minimized: bool,
}

impl WindowLayoutManager {
    pub fn new() -> Self {
        let mut layouts = HashMap::new();
        
        // Add default layouts
        layouts.insert("split-2".to_string(), WindowLayout {
            id: "split-2".to_string(),
            name: "Split (2 windows)".to_string(),
            description: "Two equal windows side by side".to_string(),
            screen_id: 0,
            zones: vec![
                Zone { id: "left".to_string(), name: "Left".to_string(), x: 0, y: 0, width: 960, height: 1080, padding: 8 },
                Zone { id: "right".to_string(), name: "Right".to_string(), x: 960, y: 0, width: 960, height: 1080, padding: 8 },
            ],
            rules: vec![],
        });
        
        layouts.insert("split-3".to_string(), WindowLayout {
            id: "split-3".to_string(),
            name: "Split (3 windows)".to_string(),
            description: "One large window on left, two stacked on right".to_string(),
            screen_id: 0,
            zones: vec![
                Zone { id: "main".to_string(), name: "Main".to_string(), x: 0, y: 0, width: 1280, height: 1080, padding: 8 },
                Zone { id: "top-right".to_string(), name: "Top Right".to_string(), x: 1280, y: 0, width: 640, height: 540, padding: 8 },
                Zone { id: "bottom-right".to_string(), name: "Bottom Right".to_string(), x: 1280, y: 540, width: 640, height: 540, padding: 8 },
            ],
            rules: vec![],
        });
        
        layouts.insert("grid-4".to_string(), WindowLayout {
            id: "grid-4".to_string(),
            name: "Grid (4 windows)".to_string(),
            description: "Four equal windows in a grid".to_string(),
            screen_id: 0,
            zones: vec![
                Zone { id: "top-left".to_string(), name: "Top Left".to_string(), x: 0, y: 0, width: 960, height: 540, padding: 8 },
                Zone { id: "top-right".to_string(), name: "Top Right".to_string(), x: 960, y: 0, width: 960, height: 540, padding: 8 },
                Zone { id: "bottom-left".to_string(), name: "Bottom Left".to_string(), x: 0, y: 540, width: 960, height: 540, padding: 8 },
                Zone { id: "bottom-right".to_string(), name: "Bottom Right".to_string(), x: 960, y: 540, width: 960, height: 540, padding: 8 },
            ],
            rules: vec![],
        });

        Self {
            layouts: Arc::new(Mutex::new(layouts)),
            active_layout: Arc::new(Mutex::new(None)),
            window_positions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Get all layouts
    pub async fn get_layouts(&self) -> Vec<WindowLayout> {
        self.layouts.lock().await.values().cloned().collect()
    }

    /// Get layout by ID
    pub async fn get_layout(&self, id: &str) -> Option<WindowLayout> {
        self.layouts.lock().await.get(id).cloned()
    }

    /// Create custom layout
    pub async fn create_layout(&self, layout: WindowLayout) -> String {
        let id = layout.id.clone();
        self.layouts.lock().await.insert(id.clone(), layout);
        id
    }

    /// Apply layout to windows
    pub async fn apply_layout(&self, layout_id: &str, windows: Vec<WindowPosition>) -> Result<Vec<WindowPlacement>> {
        let layout = self.layouts
            .lock()
            .await
            .get(layout_id)
            .cloned()
            .ok_or_else(|| Error::InvalidCommand(format!("Layout {} not found", layout_id)))?;

        *self.active_layout.lock().await = Some(layout_id.to_string());

        let mut placements = vec![];
        let mut assigned_zones: HashMap<String, u64> = HashMap::new();

        // First pass: assign by rules
        for window in &windows {
            for rule in &layout.rules {
                if Self::matches_rule(window, rule) {
                    if !assigned_zones.contains_key(&rule.target_zone) {
                        if let Some(zone) = layout.zones.iter().find(|z| z.id == rule.target_zone) {
                            placements.push(WindowPlacement {
                                window_id: window.window_id,
                                zone_id: zone.id.clone(),
                                x: zone.x + zone.padding as i32,
                                y: zone.y + zone.padding as i32,
                                width: zone.width - zone.padding * 2,
                                height: zone.height - zone.padding * 2,
                            });
                            assigned_zones.insert(rule.target_zone.clone(), window.window_id);
                        }
                    }
                }
            }
        }

        // Second pass: assign remaining windows to empty zones
        let mut zone_idx = 0;
        for window in &windows {
            if !placements.iter().any(|p| p.window_id == window.window_id) {
                while zone_idx < layout.zones.len() {
                    let zone = &layout.zones[zone_idx];
                    if !assigned_zones.contains_key(&zone.id) {
                        placements.push(WindowPlacement {
                            window_id: window.window_id,
                            zone_id: zone.id.clone(),
                            x: zone.x + zone.padding as i32,
                            y: zone.y + zone.padding as i32,
                            width: zone.width - zone.padding * 2,
                            height: zone.height - zone.padding * 2,
                        });
                        assigned_zones.insert(zone.id.clone(), window.window_id);
                        zone_idx += 1;
                        break;
                    }
                    zone_idx += 1;
                }
            }
        }

        Ok(placements)
    }

    /// Get active layout
    pub async fn get_active_layout(&self) -> Option<String> {
        self.active_layout.lock().await.clone()
    }

    /// Add rule to layout
    pub async fn add_rule(&self, layout_id: &str, rule: WindowRule) -> Result<()> {
        let mut layouts = self.layouts.lock().await;
        let layout = layouts.get_mut(layout_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Layout {} not found", layout_id)))?;
        layout.rules.push(rule);
        Ok(())
    }

    /// Delete layout
    pub async fn delete_layout(&self, layout_id: &str) -> Result<()> {
        if self.layouts.lock().await.remove(layout_id).is_none() {
            return Err(Error::InvalidCommand(format!("Layout {} not found", layout_id)));
        }
        Ok(())
    }

    fn matches_rule(window: &WindowPosition, rule: &WindowRule) -> bool {
        if !window.app_name.contains(&rule.app_name_pattern) {
            return false;
        }
        if let Some(ref title_pattern) = rule.window_title_pattern {
            if !window.window_title.contains(title_pattern) {
                return false;
            }
        }
        true
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPlacement {
    pub window_id: u64,
    pub zone_id: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}
