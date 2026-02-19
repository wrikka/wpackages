use crate::app::AppState;
use axum::{extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};

/// Middleware for API key authentication.
pub async fn api_key_auth<B>(
    State(state): State<AppState>,
    req: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    if let Some(api_key) = &state.app.config.api_key {
        let provided_key = req.headers().get("X-API-KEY").and_then(|v| v.to_str().ok());
        match provided_key {
            Some(key) if key == api_key => Ok(next.run(req).await),
            _ => Err(StatusCode::UNAUTHORIZED),
        }
    } else {
        // No API key configured, allow access
        Ok(next.run(req).await)
    }
}
