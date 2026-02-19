//! Routes Layer
//!
//! จัดการ routing สำหรับ API endpoints

use crate::app::AppState;
use crate::services::handlers::{
    check_updates, create_extension, delete_extension, get_extension, health_check,
    increment_downloads, search_extensions, update_extension,
};
use axum::{
    routing::{get, post},
    Router,
};

/// Create application router with all routes
///
/// # Arguments
///
/// * `state` - Application state containing config and database pool
///
/// # Returns
///
/// Returns configured Axum router with all routes
pub fn create_router(state: AppState) -> Router {
    Router::new()
        // Health check
        .route("/health", get(health_check))
        // Extension routes
        .route("/extensions", get(search_extensions).post(create_extension))
        .route(
            "/extensions/:id",
            get(get_extension)
                .put(update_extension)
                .delete(delete_extension),
        )
        .route("/extensions/:id/download", post(increment_downloads))
        .route("/extensions/:id/updates", get(check_updates))
        // Search
        .route("/search", get(search_extensions))
        .with_state(state)
}
