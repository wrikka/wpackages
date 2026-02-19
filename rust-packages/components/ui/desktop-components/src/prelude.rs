//! Common imports for the crate

pub use crate::error::{RsuiError, Result};

// Re-export commonly used types
pub use crate::types::*;

// Re-export the main app trait
pub use crate::types::app::RsuiApp;

// Re-export theme and context
pub use crate::context::RsuiContext;
pub use crate::types::theme::RsuiTheme;

// Re-export commonly used external crates
pub use anyhow::Context;
pub use tracing::{debug, error, info, instrument, trace, warn};
