use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Plugin {
    pub id: String,
    pub name: String,
    pub description: String,
    pub author: String,
    pub repository: Option<String>,
    pub homepage: Option<String>,
    pub license: String,
    pub keywords: Vec<String>,
    pub category: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub latest_version: String,
    pub total_downloads: i64,
    pub rating_avg: Option<f64>,
    pub rating_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PluginVersion {
    pub id: String,
    pub plugin_id: String,
    pub version: String,
    pub download_url: String,
    pub checksum: String,
    pub file_size: i64,
    pub published_at: DateTime<Utc>,
    pub downloads: i64,
    pub min_compatible_version: Option<String>,
    pub max_compatible_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PluginRating {
    pub id: String,
    pub plugin_id: String,
    pub user_id: String,
    pub rating: i32,
    pub comment: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreatePluginRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    #[validate(length(min = 1, max = 500))]
    pub description: String,
    #[validate(length(min = 1, max = 100))]
    pub author: String,
    pub repository: Option<String>,
    pub homepage: Option<String>,
    #[validate(length(min = 1, max = 50))]
    pub license: String,
    pub keywords: Vec<String>,
    #[validate(length(min = 1, max = 50))]
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateVersionRequest {
    #[validate(length(min = 1, max = 20))]
    pub version: String,
    #[validate(url)]
    pub download_url: String,
    #[validate(length(min = 1, max = 100))]
    pub checksum: String,
    pub file_size: i64,
    pub min_compatible_version: Option<String>,
    pub max_compatible_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CreateRatingRequest {
    #[validate(range(min = 1, max = 5))]
    pub rating: i32,
    pub comment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginSearchQuery {
    pub query: Option<String>,
    pub category: Option<String>,
    pub author: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginStats {
    pub total_plugins: i64,
    pub total_versions: i64,
    pub total_downloads: i64,
    pub total_ratings: i64,
}
