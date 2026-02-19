//! Database migrations

use crate::persistence::schema::{get_all_schema_sql, SCHEMA_VERSION};
use sqlx::SqlitePool;

/// Run all pending migrations
pub async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let current_version = get_current_version(pool).await?;

    if current_version < SCHEMA_VERSION {
        for sql in get_all_schema_sql() {
            sqlx::query(sql).execute(pool).await?;
        }

        set_schema_version(pool, SCHEMA_VERSION).await?;
    }

    Ok(())
}

/// Get current schema version
async fn get_current_version(pool: &SqlitePool) -> Result<i32, sqlx::Error> {
    let result = sqlx::query_scalar::<_, i32>(
        "SELECT version FROM schema_version ORDER BY version DESC LIMIT 1",
    )
    .fetch_one(pool)
    .await;

    Ok(result.unwrap_or(0))
}

/// Set schema version
async fn set_schema_version(pool: &SqlitePool, version: i32) -> Result<(), sqlx::Error> {
    let now = chrono::Utc::now().timestamp();
    sqlx::query("INSERT OR REPLACE INTO schema_version (version, applied_at) VALUES (?1, ?2)")
        .bind(version)
        .bind(now)
        .execute(pool)
        .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_run_migrations() {
        let pool = SqlitePool::connect(":memory:").await.unwrap();
        run_migrations(&pool).await.unwrap();

        let version = get_current_version(&pool).await.unwrap();
        assert_eq!(version, SCHEMA_VERSION);
    }
}
