use crate::error::EmbeddingsError;
use crate::services::EmbeddingsService;
use axum::{http::StatusCode, response::{IntoResponse, Json}};
use serde::Serialize;
use std::sync::Arc;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

impl IntoResponse for EmbeddingsError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            EmbeddingsError::InvalidConfig(_) => StatusCode::BAD_REQUEST,
            EmbeddingsError::ModelLoad(_) => StatusCode::INTERNAL_SERVER_ERROR,
            EmbeddingsError::Tokenization(_) => StatusCode::BAD_REQUEST,
            EmbeddingsError::Inference(_) => StatusCode::INTERNAL_SERVER_ERROR,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        };

        let body = Json(ErrorResponse {
            error: self.to_string(),
        });

        (status, body).into_response()
    }
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub uptime: u64,
}

#[derive(Debug, Serialize)]
pub struct MetricsResponse {
    pub total_requests: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub cache_hit_rate: f64,
    pub total_tokens: u64,
    pub total_inference_time_ms: u64,
    pub avg_inference_time_ms: f64,
}
