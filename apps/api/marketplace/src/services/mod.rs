//! Services Layer
//!
//! Effect Layer: จัดการ I/O ผ่าน Traits
//!
//! Services ทำหน้าที่:
//! - จัดการ database operations ผ่าน adapters
//! - จัดการ external API calls
//! - จัดการ side effects อื่นๆ

pub mod auth_service;
pub mod extension_service;
pub mod handlers;
pub mod routes;

pub use auth_service::AuthService;
pub use extension_service::ExtensionService;
