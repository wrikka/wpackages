//! Prelude module for convenient imports
//!
//! Import this module to get all essential types and traits:
//!
//! ```rust,no_run
//! use effect::prelude::*;
//! ```

pub use crate::types::{Context, Effect, Either, OptionEffect};
pub use crate::error::{EffectError, EffectResult};
pub use crate::services::Runtime;
pub use crate::utils::{all, race};
pub use crate::macros::*;
