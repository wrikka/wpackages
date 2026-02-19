pub mod error;
pub mod config;
pub mod telemetry;
pub mod types;
pub mod constants;
pub mod utils;
pub mod components;
pub mod services;
pub mod adapters;
pub mod app;

pub use error::{StreamingError, Result};
pub use config::AppConfig;
pub use types::{StreamMessage, StreamStats, StreamStatus};
pub use components::{SimpleProducer, SimpleConsumer};
pub use services::{Producer, Consumer, Stream, InMemoryStream};
pub use app::StreamingApp;

pub mod prelude {
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
}
