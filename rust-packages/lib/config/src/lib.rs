//! # WAI Config Suite
//!
//! Configuration management suite for WAI IDE

pub mod error;
pub mod telemetry;
pub mod types;
pub mod app;
pub mod config;
pub mod manager;
pub mod services;
pub mod components;
pub mod adapters;
pub mod utils;
pub mod constants;

pub use error::*;
pub use telemetry::*;
pub use types::*;
pub use config::*;

pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! Import this module to get all essential types and traits:
    //!
    //! ```rust,no_run
    //! use wai_config::prelude::*;
    //! ```

    pub use crate::error::*;
    pub use crate::telemetry::*;
    pub use crate::types::*;
    pub use crate::config::*;
}
