use super::id::ExtensionId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExtensionCategory {
    Other,
}

/// Defines the permissions an extension can request.
#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Permission {
    /// Allows reading from the local file system.
    ReadFs,
    /// Allows writing to the local file system.
    WriteFs,
    /// Allows making network requests.
    Network,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionManifest {
    pub name: String,
    pub id: ExtensionId,
    pub version: String,
    pub author: String,
    pub repository: String,
    pub description: String,
    pub category: ExtensionCategory,
    pub dependencies: Option<Vec<ExtensionId>>,
    #[serde(default)]
    pub permissions: Vec<Permission>,
}
