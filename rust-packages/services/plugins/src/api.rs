use crate::config::Config;
use crate::error::Result;
use crate::models::{
    CreatePluginRequest, CreateRatingRequest, CreateVersionRequest, Plugin, PluginRating,
    PluginSearchQuery, PluginStats, PluginVersion,
};
use crate::services::PluginService;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tracing::{info, warn};

pub struct ApiState {
    pub service: Arc<PluginService>,
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
    message: String,
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> axum::response::Response {
        let status = match self.error.as_str() {
            "PluginNotFound" | "VersionNotFound" => StatusCode::NOT_FOUND,
            "PluginAlreadyExists" => StatusCode::CONFLICT,
            "Validation" => StatusCode::BAD_REQUEST,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        };

        (status, Json(self)).into_response()
    }
}

pub fn create_router(config: Config, service: Arc<PluginService>) -> Router {
    let state = ApiState { service };

    Router::new()
        .route("/health", get(health_check))
        .route("/api/plugins", get(list_plugins).post(create_plugin))
        .route("/api/plugins/search", get(search_plugins))
        .route("/api/plugins/:id", get(get_plugin).delete(delete_plugin))
        .route("/api/plugins/:id/versions", get(get_plugin_versions).post(create_version))
        .route(
            "/api/plugins/:id/versions/latest",
            get(get_latest_version),
        )
        .route("/api/plugins/:id/ratings", get(get_plugin_ratings).post(create_rating))
        .route("/api/plugins/:id/download", post(increment_downloads))
        .route("/api/stats", get(get_stats))
        .layer(CorsLayer::permissive())
        .with_state(state)
}

async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn list_plugins(
    Query(params): Query<ListPluginsParams>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    let limit = params.limit.unwrap_or(20).min(100);
    let offset = params.offset.unwrap_or(0);

    let plugins = state.service.list_plugins(limit, offset).await?;
    Ok(Json(plugins))
}

#[derive(Debug, Deserialize)]
struct ListPluginsParams {
    limit: Option<usize>,
    offset: Option<usize>,
}

async fn create_plugin(
    State(state): State<ApiState>,
    Json(request): Json<CreatePluginRequest>,
) -> Result<impl IntoResponse> {
    info!("Creating plugin: {}", request.name);
    let plugin = state.service.create_plugin(request).await?;
    Ok((StatusCode::CREATED, Json(plugin)))
}

async fn get_plugin(
    Path(id): Path<String>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    let plugin = state.service.get_plugin(&id).await?;
    Ok(Json(plugin))
}

async fn delete_plugin(
    Path(id): Path<String>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    info!("Deleting plugin: {}", id);
    state.service.delete_plugin(&id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn search_plugins(
    Query(params): Query<PluginSearchQuery>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    let plugins = state.service.search_plugins(params).await?;
    Ok(Json(plugins))
}

async fn create_version(
    Path(plugin_id): Path<String>,
    State(state): State<ApiState>,
    Json(request): Json<CreateVersionRequest>,
) -> Result<impl IntoResponse> {
    info!("Creating version {} for plugin {}", request.version, plugin_id);
    let version = state.service.create_version(&plugin_id, request).await?;
    Ok((StatusCode::CREATED, Json(version)))
}

async fn get_plugin_versions(
    Path(plugin_id): Path<String>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    let versions = state.service.get_plugin_versions(&plugin_id).await?;
    Ok(Json(versions))
}

async fn get_latest_version(
    Path(plugin_id): Path<String>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    let version = state.service.get_latest_version(&plugin_id).await?;
    Ok(Json(version))
}

async fn create_rating(
    Path(plugin_id): Path<String>,
    Query(params): Query<CreateRatingParams>,
    State(state): State<ApiState>,
    Json(request): Json<CreateRatingRequest>,
) -> Result<impl IntoResponse> {
    info!("Creating rating for plugin {}", plugin_id);
    let rating = state
        .service
        .create_rating(&plugin_id, &params.user_id, request)
        .await?;
    Ok((StatusCode::CREATED, Json(rating)))
}

#[derive(Debug, Deserialize)]
struct CreateRatingParams {
    user_id: String,
}

async fn get_plugin_ratings(
    Path(plugin_id): Path<String>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    let ratings = state.service.get_plugin_ratings(&plugin_id).await?;
    Ok(Json(ratings))
}

async fn increment_downloads(
    Path(plugin_id): Path<String>,
    State(state): State<ApiState>,
) -> Result<impl IntoResponse> {
    state.service.increment_downloads(&plugin_id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_stats(State(state): State<ApiState>) -> Result<impl IntoResponse> {
    let stats = state.service.get_stats().await?;
    Ok(Json(stats))
}
