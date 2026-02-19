use super::types::{HealthResponse, MetricsResponse};
use crate::app::AppState;
use crate::types::{EmbeddingRequest, EmbeddingResponse};
use crate::EmbeddingsResult;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn health() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime: 0,
    })
}

pub async fn generate_embeddings(
    State(state): State<AppState>,
    Json(request): Json<EmbeddingRequest>,
) -> EmbeddingsResult<Json<EmbeddingResponse>> {
    let response = state.app.service.embed_text(request).await?;
    Ok(Json(response))
}

pub async fn get_metrics(State(state): State<AppState>) -> impl IntoResponse {
    let metrics = state.app.service.get_metrics().await;
    let total_requests = metrics.total_requests;
    let cache_hit_rate = if total_requests > 0 {
        metrics.cache_hits as f64 / total_requests as f64
    } else {
        0.0
    };
    let avg_inference_time_ms = if total_requests > 0 {
        metrics.total_inference_time_ms as f64 / total_requests as f64
    } else {
        0.0
    };

    Json(MetricsResponse {
        total_requests,
        cache_hits: metrics.cache_hits,
        cache_misses: metrics.cache_misses,
        cache_hit_rate,
        total_tokens: metrics.total_tokens,
        total_inference_time_ms: metrics.total_inference_time_ms,
        avg_inference_time_ms,
    })
}

pub async fn clear_cache(State(state): State<AppState>) -> impl IntoResponse {
    state.app.service.clear_cache().await;
    Json(serde_json::json!({ "message": "Cache cleared" }))
}
