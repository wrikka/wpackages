pub mod app;
pub mod config;
pub mod error;
pub mod telemetry;
pub mod pty;

// Re-export key components for easier access from main.rs
pub use app::run;
pub use config::AppConfig;
pub use error::AppError;
pub use telemetry::init_subscriber;
