//! Screen and UI element types

use serde::{Deserialize, Serialize};
use crate::types::BoundingBox;

/// Screen information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenInfo {
    pub index: u32,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_primary: bool,
}

/// UI Element representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIElement {
    pub ref_id: u32,
    pub role: String,
    pub name: Option<String>,
    pub bounds: Option<BoundingBox>,
    pub attributes: Option<serde_json::Value>,
    pub children: Vec<UIElement>,
}

impl UIElement {
    pub fn new(ref_id: u32, role: impl Into<String>) -> Self {
        Self {
            ref_id,
            role: role.into(),
            name: None,
            bounds: None,
            attributes: None,
            children: Vec::new(),
        }
    }

    pub fn with_name(mut self, name: impl Into<String>) -> Self {
        self.name = Some(name.into());
        self
    }

    pub fn with_bounds(mut self, bounds: BoundingBox) -> Self {
        self.bounds = Some(bounds);
        self
    }
}

/// UI Element type enumeration
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UIElementType {
    Button,
    TextField,
    Menu,
    Icon,
    Link,
    Checkbox,
    RadioButton,
    Dropdown,
    Slider,
    Unknown,
}
