//! Health Check Handlers
//!
//! HTTP handlers สำหรับ health check endpoints

use axum::Json;

pub async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}
