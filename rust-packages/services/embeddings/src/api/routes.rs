use super::handlers;
use crate::{app::AppState, middleware::auth::api_key_auth};
use axum::{routing::{get, post}, Router};

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/embeddings", post(handlers::generate_embeddings))
        .route("/metrics", get(handlers::get_metrics))
        .route("/cache/clear", post(handlers::clear_cache))
        .route_layer(axum::middleware::from_fn_with_state(
            state.clone(),
            api_key_auth,
        ))
        .with_state(state)
}
