use crate::database::Database;
use crate::error::{Error, Result};
use crate::models::{
    CreatePluginRequest, CreateRatingRequest, CreateVersionRequest, Plugin, PluginRating,
    PluginSearchQuery, PluginStats, PluginVersion,
};
use chrono::Utc;
use uuid::Uuid;

pub struct PluginService {
    db: Database,
}

impl PluginService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    // Plugin operations
    pub async fn create_plugin(
        &self,
        request: CreatePluginRequest,
    ) -> Result<Plugin> {
        // Check if plugin with same name already exists
        if let Some(_) = self.db.get_plugin_by_name(&request.name).await? {
            return Err(Error::PluginAlreadyExists(request.name));
        }

        let id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let plugin = Plugin {
            id: id.clone(),
            name: request.name,
            description: request.description,
            author: request.author,
            repository: request.repository,
            homepage: request.homepage,
            license: request.license,
            keywords: request.keywords,
            category: request.category,
            created_at: now,
            updated_at: now,
            latest_version: "0.0.0".to_string(),
            total_downloads: 0,
            rating_avg: None,
            rating_count: 0,
        };

        self.db.create_plugin(plugin).await
    }

    pub async fn get_plugin(&self, id: &str) -> Result<Plugin> {
        self.db
            .get_plugin(id)
            .await?
            .ok_or_else(|| Error::PluginNotFound(id.to_string()))
    }

    pub async fn get_plugin_by_name(&self, name: &str) -> Result<Plugin> {
        self.db
            .get_plugin_by_name(name)
            .await?
            .ok_or_else(|| Error::PluginNotFound(name.to_string()))
    }

    pub async fn list_plugins(
        &self,
        limit: usize,
        offset: usize,
    ) -> Result<Vec<Plugin>> {
        self.db.list_plugins(limit, offset).await
    }

    pub async fn search_plugins(&self, query: PluginSearchQuery) -> Result<Vec<Plugin>> {
        let limit = query.limit.unwrap_or(20);
        let offset = query.offset.unwrap_or(0);

        self.db
            .search_plugins(
                query.query.as_deref(),
                query.category.as_deref(),
                query.author.as_deref(),
                query.keywords,
                limit,
                offset,
            )
            .await
    }

    pub async fn update_plugin(
        &self,
        id: &str,
        mut plugin: Plugin,
    ) -> Result<Plugin> {
        // Verify plugin exists
        let existing = self.get_plugin(id).await?;

        plugin.id = existing.id;
        plugin.created_at = existing.created_at;
        plugin.updated_at = Utc::now();

        self.db.update_plugin(plugin).await
    }

    pub async fn delete_plugin(&self, id: &str) -> Result<()> {
        // Verify plugin exists
        self.get_plugin(id).await?;
        self.db.delete_plugin(id).await
    }

    pub async fn increment_downloads(&self, id: &str) -> Result<()> {
        self.db.increment_downloads(id).await
    }

    // Version operations
    pub async fn create_version(
        &self,
        plugin_id: &str,
        request: CreateVersionRequest,
    ) -> Result<PluginVersion> {
        // Verify plugin exists
        let plugin = self.get_plugin(plugin_id).await?;

        let id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let version = PluginVersion {
            id: id.clone(),
            plugin_id: plugin_id.to_string(),
            version: request.version.clone(),
            download_url: request.download_url,
            checksum: request.checksum,
            file_size: request.file_size,
            published_at: now,
            downloads: 0,
            min_compatible_version: request.min_compatible_version,
            max_compatible_version: request.max_compatible_version,
        };

        let created_version = self.db.create_version(version).await?;

        // Update plugin's latest version
        let mut updated_plugin = plugin;
        updated_plugin.latest_version = request.version;
        updated_plugin.updated_at = now;
        self.db.update_plugin(updated_plugin).await?;

        Ok(created_version)
    }

    pub async fn get_version(&self, id: &str) -> Result<PluginVersion> {
        self.db
            .get_version(id)
            .await?
            .ok_or_else(|| Error::VersionNotFound(id.to_string()))
    }

    pub async fn get_plugin_versions(&self, plugin_id: &str) -> Result<Vec<PluginVersion>> {
        self.get_plugin(plugin_id).await?;
        self.db.get_plugin_versions(plugin_id).await
    }

    pub async fn get_latest_version(&self, plugin_id: &str) -> Result<PluginVersion> {
        self.get_plugin(plugin_id).await?;
        self.db
            .get_latest_version(plugin_id)
            .await?
            .ok_or_else(|| Error::VersionNotFound(plugin_id.to_string()))
    }

    // Rating operations
    pub async fn create_rating(
        &self,
        plugin_id: &str,
        user_id: &str,
        request: CreateRatingRequest,
    ) -> Result<PluginRating> {
        // Verify plugin exists
        self.get_plugin(plugin_id).await?;

        let id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let rating = PluginRating {
            id,
            plugin_id: plugin_id.to_string(),
            user_id: user_id.to_string(),
            rating: request.rating,
            comment: request.comment,
            created_at: now,
        };

        self.db.create_rating(rating).await
    }

    pub async fn get_plugin_ratings(&self, plugin_id: &str) -> Result<Vec<PluginRating>> {
        self.get_plugin(plugin_id).await?;
        self.db.get_plugin_ratings(plugin_id).await
    }

    // Stats
    pub async fn get_stats(&self) -> Result<PluginStats> {
        self.db.get_stats().await
    }
}
