//! types/marketplace.rs

use serde::{Deserialize, Serialize};

/// Represents a tool that is published to the decentralized marketplace.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolListing {
    pub name: String,
    pub description: String,
    pub author: String, // Could be an agent ID
    pub download_url: String, // A path to the compiled tool library
}
