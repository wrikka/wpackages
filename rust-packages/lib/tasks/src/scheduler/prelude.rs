//! Prelude module for convenient imports
//!
//! Import this module to get all essential types and traits:
//!
//! ```rust,no_run
//! use scheduler::prelude::*;
//! ```

pub use crate::error::{SchedulerError, Result};
pub use crate::components::*;
pub use crate::services::*;
pub use crate::types::*;
