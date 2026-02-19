//! types/ui.rs

use serde::{Deserialize, Serialize};

/// Represents a component in a dynamically generated UI.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum UiComponent {
    Text {
        content: String,
    },
    Button {
        label: String,
        value: String,
    },
    InputField {
        label: String,
        name: String,
    },
}

/// Represents a full UI form to be rendered for the user.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiForm {
    pub title: String,
    pub components: Vec<UiComponent>,
}
