//! # Error Library
//!
//! Unified error handling for the workspace.

pub mod app;
pub mod chain;
pub mod context;
pub mod ext;

pub use app::AppError;
pub use chain::ErrorChain;
pub use context::ErrorContext;
pub use ext::ResultExt;

/// Convenient result type alias
pub type AppResult<T> = std::result::Result<T, AppError>;
