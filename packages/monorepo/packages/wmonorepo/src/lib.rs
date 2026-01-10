pub mod adapters;
pub mod ai;
pub mod analytics;
pub mod app;
pub mod collaboration;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

pub use error::{AppError, AppResult};

pub use app::run_app;
