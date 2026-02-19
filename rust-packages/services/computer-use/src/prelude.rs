//! Common imports for computer-use
//!
//! This module re-exports commonly used types and traits.

// External crates
pub use anyhow::{anyhow, Context as AnyhowContext};
pub use serde::{Deserialize, Serialize};
pub use serde_json::{json, Value as JsonValue};
pub use tokio::sync::{mpsc, oneshot, Mutex, RwLock};
pub use tracing::{debug, error, info, instrument, trace, warn, Span};

// Internal types
pub use crate::config::Config;
pub use crate::error::{Error, Result};

// Common types from types module
pub use crate::types::{
    Action, BoundingBox, Position, ScreenInfo, SessionId, TaskGoal, TaskResult, UIElement,
    Command, Response,
};
