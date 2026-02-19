//! API Handlers
//!
//! HTTP handlers ที่เรียกใช้ services layer

pub mod extension_handlers;
pub mod health_handlers;

pub use health_handlers::*;

// Re-export for routes
pub use extension_handlers::{
    check_updates, create_extension, delete_extension, get_extension, increment_downloads,
    search_extensions, update_extension,
};
