//! Extension Handlers
//!
//! HTTP handlers สำหรับ extension endpoints

use crate::app::AppState;
use crate::components::{validate_extension_request, validate_update_request};
use crate::error::{ApiError, ApiResult};
use crate::services::ExtensionService;
use crate::types::models::{
    CreateExtensionRequest, Extension, ExtensionSearchResult, ExtensionUpdate,
    UpdateExtensionRequest,
};
use axum::extract::{Json, Path, Query, State};
use tracing::info;
use uuid::Uuid;

pub async fn search_extensions(
    Query(query): Query<crate::types::models::SearchQuery>,
    State(state): State<AppState>,
) -> ApiResult<Json<Vec<ExtensionSearchResult>>> {
    info!("Searching extensions with query: {:?}", query);
    let service = ExtensionService::new(state.pool);
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.offset.unwrap_or(0);

    let results = service
        .search(query.q, query.category, limit, offset)
        .await?;

    Ok(Json(results))
}

pub async fn get_extension(
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
) -> ApiResult<Json<Extension>> {
    info!("Getting extension with id: {}", id);
    let service = ExtensionService::new(state.pool);
    let extension = service.get_by_id(id).await?;
    Ok(Json(extension))
}

pub async fn create_extension(
    State(state): State<AppState>,
    Json(req): Json<CreateExtensionRequest>,
) -> ApiResult<Json<Extension>> {
    info!("Creating extension: {}", req.name);
    validate_extension_request(&req).map_err(|e| ApiError::BadRequest(e))?;

    let service = ExtensionService::new(state.pool);
    let extension = service.create(req).await?;
    Ok(Json(extension))
}

pub async fn update_extension(
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
    Json(req): Json<UpdateExtensionRequest>,
) -> ApiResult<Json<Extension>> {
    info!("Updating extension with id: {}", id);
    validate_update_request(&req).map_err(|e| ApiError::BadRequest(e))?;

    let service = ExtensionService::new(state.pool);
    let extension = service.update(id, req).await?;
    Ok(Json(extension))
}

pub async fn delete_extension(
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
) -> ApiResult<Json<serde_json::Value>> {
    info!("Deleting extension with id: {}", id);
    let service = ExtensionService::new(state.pool);
    service.delete(id).await?;

    Ok(Json(serde_json::json!({
        "message": "Extension deleted successfully"
    })))
}

pub async fn increment_downloads(
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
) -> ApiResult<Json<serde_json::Value>> {
    info!("Incrementing downloads for extension: {}", id);
    let service = ExtensionService::new(state.pool);
    service.increment_downloads(id).await?;

    Ok(Json(serde_json::json!({
        "message": "Download count incremented"
    })))
}

pub async fn check_updates(
    Path(extension_id): Path<Uuid>,
    State(state): State<AppState>,
) -> ApiResult<Json<Option<ExtensionUpdate>>> {
    info!("Checking updates for extension: {}", extension_id);
    let service = ExtensionService::new(state.pool);
    let update = service.check_updates(extension_id).await?;
    Ok(Json(update))
}
