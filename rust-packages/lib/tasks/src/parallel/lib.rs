//! Parallel processing utilities

pub mod components;
pub mod types;
pub mod error;
pub mod services;
pub mod config;
pub mod adapters;
pub mod constants;

pub use components::*;
pub use error::{ParallelError, Result};
pub use services::*;

pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! Import this module to get all essential types and traits:
    //!
    //! ```rust,no_run
    //! use parallel::prelude::*;
    //! ```

    pub use crate::components::*;
    pub use crate::error::{ParallelError, Result};
    pub use crate::services::*;
}
