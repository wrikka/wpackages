//! # Marketplace
//!
//! Template marketplace for workflow sharing and distribution.
//!
//! ## Features
//!
//! - Template submission and management
//! - Search and filtering
//! - Reviews and ratings
//! - Categories and tags
//! - Import/export

pub mod error;
pub mod types;

pub use error::{MarketplaceError, Result};
pub use types::*;
