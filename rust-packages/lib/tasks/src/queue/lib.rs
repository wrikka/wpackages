//! Task queue implementation

pub mod adapters;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod types;
pub mod utils;

pub use error::{QueueError, Result};
pub use services::*;
pub use types::*;

pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! Import this module to get all essential types and traits:
    //!
    //! ```rust,no_run
    //! use queue::prelude::*;
    //! ```

    pub use crate::error::{QueueError, Result};
    pub use crate::services::*;
    pub use crate::types::*;
}
