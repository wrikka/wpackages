//! Application Layer
//!
//! Orchestrates business flows และ coordinates ระหว่าง components และ services

use crate::adapters::db::create_pool;
use crate::config::Config;
use crate::services::routes::create_router;
use axum::Router;
use sqlx::PgPool;

/// Create application router with all dependencies
///
/// # Arguments
///
/// * `config` - Application configuration
///
/// # Returns
///
/// Returns configured Axum router
pub async fn create_app(config: Config) -> anyhow::Result<Router> {
    // Initialize database pool
    let pool = create_pool(&config.database.url, config.database.max_connections).await?;

    // Run migrations
    crate::adapters::db::run_migrations(&pool).await?;

    // Create application state
    let state = AppState::new(config.clone(), pool);

    // Create router with state
    let app = create_router(state);

    Ok(app)
}

/// Application state
#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub pool: PgPool,
}

impl AppState {
    /// Create new application state
    pub fn new(config: Config, pool: PgPool) -> Self {
        Self { config, pool }
    }
}
