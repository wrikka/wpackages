//! Data models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Extension manifest from the extensions package
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Extension {
    pub id: Uuid,
    pub name: String,
    pub version: String,
    pub author: String,
    pub repository: String,
    pub description: String,
    pub category: String,
    pub download_url: String,
    pub downloads: i64,
    pub rating: f32,
    pub author_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Extension for search results
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ExtensionSearchResult {
    pub id: Uuid,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub downloads: i64,
    pub rating: f32,
    pub author_verified: bool,
}

/// Create extension request
#[derive(Debug, Deserialize, Validate)]
pub struct CreateExtensionRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,

    #[validate(length(min = 1, max = 50))]
    pub version: String,

    #[validate(length(min = 1, max = 100))]
    pub author: String,

    #[validate(url)]
    pub repository: String,

    #[validate(length(min = 1, max = 500))]
    pub description: String,

    #[validate(length(min = 1, max = 50))]
    pub category: String,

    #[validate(url)]
    pub download_url: String,
}

/// Update extension request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateExtensionRequest {
    #[validate(length(min = 1, max = 500))]
    pub description: Option<String>,

    #[validate(url)]
    pub download_url: Option<String>,

    pub version: Option<String>,
}

/// Search query parameters
#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
    pub category: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Extension update info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionUpdate {
    pub extension_id: Uuid,
    pub current_version: String,
    pub latest_version: String,
    pub changelog: String,
    pub download_url: String,
}
