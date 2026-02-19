use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};

/// Middleware for API key authentication.
pub async fn api_key_auth<B>(req: Request<B>, next: Next<B>) -> Result<Response, StatusCode> {
    let api_key = req.headers().get("X-API-KEY").and_then(|v| v.to_str().ok());

    match api_key {
        Some(key) if key == std::env::var("API_KEY").unwrap_or_else(|_| "dev-key".to_string()) => {
            Ok(next.run(req).await)
        }
        _ => Err(StatusCode::UNAUTHORIZED),
    }
}
