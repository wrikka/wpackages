use crate::error::Result;
use crate::models::{Plugin, PluginRating, PluginStats, PluginVersion};
use sqlx::{Pool, Sqlite};
use uuid::Uuid;

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = sqlx::SqlitePool::connect(database_url).await?;
        Ok(Self { pool })
    }

    pub async fn migrate(&self) -> Result<()> {
        sqlx::migrate!("./migrations").run(&self.pool).await?;
        Ok(())
    }

    pub fn pool(&self) -> &Pool<Sqlite> {
        &self.pool
    }

    // Plugin operations
    pub async fn create_plugin(&self, plugin: Plugin) -> Result<Plugin> {
        sqlx::query(
            r#"
            INSERT INTO plugins (
                id, name, description, author, repository, homepage,
                license, keywords, category, created_at, updated_at,
                latest_version, total_downloads, rating_avg, rating_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&plugin.id)
        .bind(&plugin.name)
        .bind(&plugin.description)
        .bind(&plugin.author)
        .bind(&plugin.repository)
        .bind(&plugin.homepage)
        .bind(&plugin.license)
        .bind(serde_json::to_string(&plugin.keywords)?)
        .bind(&plugin.category)
        .bind(plugin.created_at)
        .bind(plugin.updated_at)
        .bind(&plugin.latest_version)
        .bind(plugin.total_downloads)
        .bind(plugin.rating_avg)
        .bind(plugin.rating_count)
        .execute(&self.pool)
        .await?;

        Ok(plugin)
    }

    pub async fn get_plugin(&self, id: &str) -> Result<Option<Plugin>> {
        let plugin = sqlx::query_as::<_, Plugin>(
            "SELECT * FROM plugins WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(plugin)
    }

    pub async fn get_plugin_by_name(&self, name: &str) -> Result<Option<Plugin>> {
        let plugin = sqlx::query_as::<_, Plugin>(
            "SELECT * FROM plugins WHERE name = ?"
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await?;

        Ok(plugin)
    }

    pub async fn list_plugins(
        &self,
        limit: usize,
        offset: usize,
    ) -> Result<Vec<Plugin>> {
        let plugins = sqlx::query_as::<_, Plugin>(
            "SELECT * FROM plugins ORDER BY created_at DESC LIMIT ? OFFSET ?"
        )
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&self.pool)
        .await?;

        Ok(plugins)
    }

    pub async fn search_plugins(
        &self,
        query: Option<&str>,
        category: Option<&str>,
        author: Option<&str>,
        keywords: Option<Vec<String>>,
        limit: usize,
        offset: usize,
    ) -> Result<Vec<Plugin>> {
        let mut sql = "SELECT * FROM plugins WHERE 1=1".to_string();
        let mut params = Vec::new();

        if let Some(q) = query {
            sql.push_str(" AND (name LIKE ? OR description LIKE ?)");
            params.push(format!("%{}%", q));
            params.push(format!("%{}%", q));
        }

        if let Some(cat) = category {
            sql.push_str(" AND category = ?");
            params.push(cat.to_string());
        }

        if let Some(auth) = author {
            sql.push_str(" AND author = ?");
            params.push(auth.to_string());
        }

        if let Some(kws) = keywords {
            for kw in kws {
                sql.push_str(" AND keywords LIKE ?");
                params.push(format!("%\"{}\"%", kw));
            }
        }

        sql.push_str(" ORDER BY created_at DESC LIMIT ? OFFSET ?");
        params.push(limit.to_string());
        params.push(offset.to_string());

        let mut query_builder = sqlx::query_as::<_, Plugin>(&sql);
        for param in params {
            query_builder = query_builder.bind(param);
        }

        let plugins = query_builder.fetch_all(&self.pool).await?;
        Ok(plugins)
    }

    pub async fn update_plugin(&self, plugin: Plugin) -> Result<Plugin> {
        sqlx::query(
            r#"
            UPDATE plugins SET
                name = ?, description = ?, author = ?, repository = ?, homepage = ?,
                license = ?, keywords = ?, category = ?, updated_at = ?,
                latest_version = ?, total_downloads = ?, rating_avg = ?, rating_count = ?
            WHERE id = ?
            "#,
        )
        .bind(&plugin.name)
        .bind(&plugin.description)
        .bind(&plugin.author)
        .bind(&plugin.repository)
        .bind(&plugin.homepage)
        .bind(&plugin.license)
        .bind(serde_json::to_string(&plugin.keywords)?)
        .bind(&plugin.category)
        .bind(plugin.updated_at)
        .bind(&plugin.latest_version)
        .bind(plugin.total_downloads)
        .bind(plugin.rating_avg)
        .bind(plugin.rating_count)
        .bind(&plugin.id)
        .execute(&self.pool)
        .await?;

        Ok(plugin)
    }

    pub async fn delete_plugin(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM plugins WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn increment_downloads(&self, plugin_id: &str) -> Result<()> {
        sqlx::query(
            "UPDATE plugins SET total_downloads = total_downloads + 1 WHERE id = ?"
        )
        .bind(plugin_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Plugin version operations
    pub async fn create_version(&self, version: PluginVersion) -> Result<PluginVersion> {
        sqlx::query(
            r#"
            INSERT INTO plugin_versions (
                id, plugin_id, version, download_url, checksum, file_size,
                published_at, downloads, min_compatible_version, max_compatible_version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&version.id)
        .bind(&version.plugin_id)
        .bind(&version.version)
        .bind(&version.download_url)
        .bind(&version.checksum)
        .bind(version.file_size)
        .bind(version.published_at)
        .bind(version.downloads)
        .bind(&version.min_compatible_version)
        .bind(&version.max_compatible_version)
        .execute(&self.pool)
        .await?;

        Ok(version)
    }

    pub async fn get_version(&self, id: &str) -> Result<Option<PluginVersion>> {
        let version = sqlx::query_as::<_, PluginVersion>(
            "SELECT * FROM plugin_versions WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(version)
    }

    pub async fn get_plugin_versions(&self, plugin_id: &str) -> Result<Vec<PluginVersion>> {
        let versions = sqlx::query_as::<_, PluginVersion>(
            "SELECT * FROM plugin_versions WHERE plugin_id = ? ORDER BY published_at DESC"
        )
        .bind(plugin_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(versions)
    }

    pub async fn get_latest_version(&self, plugin_id: &str) -> Result<Option<PluginVersion>> {
        let version = sqlx::query_as::<_, PluginVersion>(
            r#"
            SELECT * FROM plugin_versions
            WHERE plugin_id = ?
            ORDER BY published_at DESC
            LIMIT 1
            "#
        )
        .bind(plugin_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(version)
    }

    // Plugin rating operations
    pub async fn create_rating(&self, rating: PluginRating) -> Result<PluginRating> {
        sqlx::query(
            r#"
            INSERT INTO plugin_ratings (id, plugin_id, user_id, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&rating.id)
        .bind(&rating.plugin_id)
        .bind(&rating.user_id)
        .bind(rating.rating)
        .bind(&rating.comment)
        .bind(rating.created_at)
        .execute(&self.pool)
        .await?;

        // Update plugin rating stats
        self.update_plugin_rating_stats(&rating.plugin_id).await?;

        Ok(rating)
    }

    pub async fn get_plugin_ratings(&self, plugin_id: &str) -> Result<Vec<PluginRating>> {
        let ratings = sqlx::query_as::<_, PluginRating>(
            "SELECT * FROM plugin_ratings WHERE plugin_id = ? ORDER BY created_at DESC"
        )
        .bind(plugin_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(ratings)
    }

    pub async fn update_plugin_rating_stats(&self, plugin_id: &str) -> Result<()> {
        sqlx::query(
            r#"
            UPDATE plugins SET
                rating_avg = (
                    SELECT AVG(rating) FROM plugin_ratings WHERE plugin_id = ?
                ),
                rating_count = (
                    SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = ?
                )
            WHERE id = ?
            "#
        )
        .bind(plugin_id)
        .bind(plugin_id)
        .bind(plugin_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Stats
    pub async fn get_stats(&self) -> Result<PluginStats> {
        let total_plugins: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM plugins")
            .fetch_one(&self.pool)
            .await?;

        let total_versions: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM plugin_versions")
            .fetch_one(&self.pool)
            .await?;

        let total_downloads: i64 = sqlx::query_scalar("SELECT SUM(total_downloads) FROM plugins")
            .fetch_one(&self.pool)
            .await?;

        let total_ratings: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM plugin_ratings")
            .fetch_one(&self.pool)
            .await?;

        Ok(PluginStats {
            total_plugins,
            total_versions,
            total_downloads: total_downloads.unwrap_or(0),
            total_ratings,
        })
    }
}
