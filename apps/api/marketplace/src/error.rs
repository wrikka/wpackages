//! API Error Types
//!
//! Custom error types สำหรับ Marketplace API
//!
//! # Example
//!
//! ```rust
//! use marketplace_api::error::{ApiError, ApiResult};
//!
//! async fn get_extension(id: Uuid) -> ApiResult<Extension> {
//!     // ... implementation
//!     Ok(extension)
//! }
//! ```

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

/// API Error types
#[derive(Error, Debug)]
pub enum ApiError {
    /// Database error
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    /// Resource not found
    #[error("Not found: {resource} (id: {id})")]
    NotFound { resource: String, id: String },

    /// Bad request
    #[error("Bad request: {0}")]
    BadRequest(String),

    /// Unauthorized access
    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    /// Internal server error
    #[error("Internal server error: {0}")]
    Internal(String),

    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),
}

impl ApiError {
    /// Get HTTP status code for the error
    pub fn status_code(&self) -> StatusCode {
        match self {
            ApiError::Database(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::NotFound { .. } => StatusCode::NOT_FOUND,
            ApiError::BadRequest(_) => StatusCode::BAD_REQUEST,
            ApiError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            ApiError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Validation(_) => StatusCode::BAD_REQUEST,
        }
    }

    /// Create a not found error
    pub fn not_found(resource: impl Into<String>, id: impl Into<String>) -> Self {
        Self::NotFound {
            resource: resource.into(),
            id: id.into(),
        }
    }

    /// Create a bad request error
    pub fn bad_request(msg: impl Into<String>) -> Self {
        Self::BadRequest(msg.into())
    }

    /// Create an unauthorized error
    pub fn unauthorized(msg: impl Into<String>) -> Self {
        Self::Unauthorized(msg.into())
    }

    /// Create an internal error
    pub fn internal(msg: impl Into<String>) -> Self {
        Self::Internal(msg.into())
    }

    /// Create a validation error
    pub fn validation(msg: impl Into<String>) -> Self {
        Self::Validation(msg.into())
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let error_message = match &self {
            ApiError::Database(err) => {
                tracing::error!("Database error: {:?}", err);
                "Database error".to_string()
            }
            ApiError::NotFound { resource, id } => {
                tracing::warn!("Not found: {} (id: {})", resource, id);
                format!("{} not found", resource)
            }
            ApiError::BadRequest(msg) => {
                tracing::warn!("Bad request: {}", msg);
                msg.clone()
            }
            ApiError::Unauthorized(msg) => {
                tracing::warn!("Unauthorized: {}", msg);
                msg.clone()
            }
            ApiError::Internal(msg) => {
                tracing::error!("Internal error: {}", msg);
                "Internal server error".to_string()
            }
            ApiError::Validation(msg) => {
                tracing::warn!("Validation error: {}", msg);
                msg.clone()
            }
        };

        let body = json!({
            "error": error_message,
        });

        (status, Json(body)).into_response()
    }
}

/// API Result type alias
pub type ApiResult<T> = Result<T, ApiError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_status_codes() {
        assert_eq!(
            ApiError::Database(sqlx::Error::RowNotFound).status_code(),
            StatusCode::INTERNAL_SERVER_ERROR
        );
        assert_eq!(
            ApiError::not_found("Extension", "123").status_code(),
            StatusCode::NOT_FOUND
        );
        assert_eq!(
            ApiError::bad_request("test").status_code(),
            StatusCode::BAD_REQUEST
        );
        assert_eq!(
            ApiError::unauthorized("test").status_code(),
            StatusCode::UNAUTHORIZED
        );
        assert_eq!(
            ApiError::internal("test").status_code(),
            StatusCode::INTERNAL_SERVER_ERROR
        );
        assert_eq!(
            ApiError::validation("test").status_code(),
            StatusCode::BAD_REQUEST
        );
    }

    #[test]
    fn test_error_constructors() {
        let err = ApiError::not_found("Extension", "123");
        match err {
            ApiError::NotFound { resource, id } => {
                assert_eq!(resource, "Extension");
                assert_eq!(id, "123");
            }
            _ => panic!("Expected NotFound error"),
        }

        let err = ApiError::bad_request("Invalid input");
        assert_eq!(err.to_string(), "Bad request: Invalid input");
    }
}
