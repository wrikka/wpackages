//! Components Layer
//!
//! Pure Layer: Domain logic ที่บริสุทธิ์
//!
//! Components คือ pure functions ที่:
//! - ไม่มี side effects
//! - ไม่มี dependencies ภายใน
//! - ง่ายต่อการ test

pub mod search;
pub mod validation;

pub use search::{build_search_query, normalize_search_term};
pub use validation::{validate_extension_request, validate_update_request};
