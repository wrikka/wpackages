use serde::{Deserialize, Serialize};

/// Represents a value that can be stored as a setting.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SettingValue {
    String(String),
    Number(f64),
    Boolean(bool),
    Null,
}

/// Defines the specification for a setting that an extension contributes.
#[derive(Debug, Clone)]
pub struct SettingSpec {
    /// A unique key for the setting, e.g., "myExtension.feature.enabled".
    pub key: String,
    /// The default value for the setting.
    pub default: SettingValue,
    /// A description of what the setting does.
    pub description: String,
}
