//! Marketplace API Library
//!
//! Extension marketplace API for wterminal
//!
//! # Features
//!
//! - Extension CRUD operations
//! - Search and filtering
//! - Download tracking
//! - Update checking
//!
//! # Example
//!
//! ```rust,no_run
//! use marketplace_api::{Config, create_app};
//!
//! #[tokio::main]
//! async fn main() -> anyhow::Result<()> {
//!     let config = Config::load()?;
//!     let app = create_app(config).await?;
//!     // Run the app...
//!     Ok(())
//! }
//! ```

pub mod adapters;
pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

pub use app::create_app;
pub use config::Config;
pub use error::{ApiError, ApiResult};
