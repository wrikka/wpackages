//! Prelude module for convenient imports
//!
//! Import this module to get all essential types and traits:
//!
//! ```rust,no_run
//! use streaming::prelude::*;
//! ```

pub use crate::error::{StreamingError, Result};
pub use crate::config::AppConfig;
pub use crate::types::{StreamMessage, StreamStats, StreamStatus};
pub use crate::components::{SimpleProducer, SimpleConsumer};
pub use crate::services::{Producer, Consumer, Stream, InMemoryStream};
pub use crate::app::StreamingApp;
