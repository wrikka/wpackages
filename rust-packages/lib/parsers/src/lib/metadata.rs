//! Library metadata and information
//!
//! This module provides library information and metadata.

use napi_derive::napi;
use serde_json::json;

// Library version and metadata
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const NAME: &str = env!("CARGO_PKG_NAME");
pub const DESCRIPTION: &str = env!("CARGO_PKG_DESCRIPTION");

/// Get library information
#[napi]
pub fn get_library_info() -> serde_json::Value {
    json!({
        "name": NAME,
        "version": VERSION,
        "description": DESCRIPTION,
        "supported_formats": ["json", "toml", "xml", "yaml"],
        "features": [
            "auto-detection",
            "streaming",
            "validation",
            "caching",
            "security",
            "plugins",
            "nodejs-integration"
        ]
    })
}
