//! Extension Repository
//!
//! Adapter สำหรับ SQLx database operations

use crate::types::models::{
    CreateExtensionRequest, Extension, ExtensionSearchResult, ExtensionUpdate,
    UpdateExtensionRequest,
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct ExtensionRepository {
    pool: PgPool,
}

impl ExtensionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn search(
        &self,
        query: Option<String>,
        category: Option<String>,
        limit: usize,
        offset: usize,
    ) -> Result<Vec<ExtensionSearchResult>, sqlx::Error> {
        let results = if let Some(search_term) = query {
            sqlx::query_as::<_, ExtensionSearchResult>(
                r#"
                SELECT id, name, version, author, description, downloads, rating, author_verified
                FROM extensions
                WHERE
                    name ILIKE $1 OR
                    description ILIKE $1 OR
                    author ILIKE $1
                ORDER BY downloads DESC, rating DESC
                LIMIT $2 OFFSET $3
                "#,
            )
            .bind(format!("%{}%", search_term))
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await?
        } else if let Some(category) = category {
            sqlx::query_as::<_, ExtensionSearchResult>(
                r#"
                SELECT id, name, version, author, description, downloads, rating, author_verified
                FROM extensions
                WHERE category = $1
                ORDER BY downloads DESC, rating DESC
                LIMIT $2 OFFSET $3
                "#,
            )
            .bind(category)
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query_as::<_, ExtensionSearchResult>(
                r#"
                SELECT id, name, version, author, description, downloads, rating, author_verified
                FROM extensions
                ORDER BY downloads DESC, rating DESC
                LIMIT $1 OFFSET $2
                "#,
            )
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&self.pool)
            .await?
        };

        Ok(results)
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<Extension>, sqlx::Error> {
        sqlx::query_as::<_, Extension>(
            r#"
            SELECT id, name, version, author, repository, description, category,
                   download_url, downloads, rating, author_verified, created_at, updated_at
            FROM extensions
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn create(&self, req: CreateExtensionRequest) -> Result<Extension, sqlx::Error> {
        let id = Uuid::new_v4();
        let now = chrono::Utc::now();

        sqlx::query_as::<_, Extension>(
            r#"
            INSERT INTO extensions (id, name, version, author, repository, description,
                                   category, download_url, downloads, rating, author_verified,
                                   created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, name, version, author, repository, description, category,
                      download_url, downloads, rating, author_verified, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(req.name)
        .bind(req.version)
        .bind(req.author)
        .bind(req.repository)
        .bind(req.description)
        .bind(req.category)
        .bind(req.download_url)
        .bind(0i64)
        .bind(0.0f32)
        .bind(false)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(
        &self,
        id: Uuid,
        req: UpdateExtensionRequest,
    ) -> Result<Option<Extension>, sqlx::Error> {
        sqlx::query_as::<_, Extension>(
            r#"
            UPDATE extensions
            SET
                description = COALESCE($1, description),
                download_url = COALESCE($2, download_url),
                version = COALESCE($3, version),
                updated_at = $4
            WHERE id = $5
            RETURNING id, name, version, author, repository, description, category,
                      download_url, downloads, rating, author_verified, created_at, updated_at
            "#,
        )
        .bind(req.description)
        .bind(req.download_url)
        .bind(req.version)
        .bind(chrono::Utc::now())
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn delete(&self, id: Uuid) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM extensions WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn increment_downloads(&self, id: Uuid) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("UPDATE extensions SET downloads = downloads + 1 WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn check_updates(
        &self,
        extension_id: Uuid,
    ) -> Result<Option<ExtensionUpdate>, sqlx::Error> {
        let result: Option<(Uuid, String, String, Option<String>, Option<String>)> =
            sqlx::query_as(
                r#"
                SELECT id, name, version, download_url, description
                FROM extensions
                WHERE id = $1
                "#,
            )
            .bind(extension_id)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(ext) = result {
            let update = ExtensionUpdate {
                extension_id: ext.0,
                current_version: ext.2.clone(),
                latest_version: ext.2,
                changelog: ext.4.unwrap_or_default(),
                download_url: ext.3.unwrap_or_default(),
            };
            Ok(Some(update))
        } else {
            Ok(None)
        }
    }
}
