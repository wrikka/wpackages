//! Database connection and migrations
//!
//! Effect Layer: จัดการ database I/O

use sqlx::{postgres::PgPoolOptions, PgPool};
use tracing::info;

/// Create database connection pool
///
/// # Arguments
///
/// * `database_url` - PostgreSQL connection URL
/// * `max_connections` - Maximum connections in pool
///
/// # Returns
///
/// Returns configured PgPool
pub async fn create_pool(database_url: &str, max_connections: u32) -> anyhow::Result<PgPool> {
    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .connect(database_url)
        .await?;

    info!(
        "Database pool created with {} max connections",
        max_connections
    );
    Ok(pool)
}

/// Run database migrations
///
/// # Arguments
///
/// * `pool` - Database connection pool
pub async fn run_migrations(pool: &PgPool) -> anyhow::Result<()> {
    sqlx::migrate!("./migrations").run(pool).await?;
    info!("Database migrations completed");
    Ok(())
}
