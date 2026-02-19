//! Task scheduler implementation

pub mod adapters;
pub mod app;
pub mod components;
pub mod config;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;

pub use components::*;
pub use error::{Result, SchedulerError};
pub use services::*;
pub use types::*;

pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! Import this module to get all essential types and traits:
    //!
    //! ```rust,no_run
    //! use scheduler::prelude::*;
    //! ```

    pub use crate::components::*;
    pub use crate::error::{Result, SchedulerError};
    pub use crate::services::*;
    pub use crate::types::*;
}
