pub mod config;
pub mod error;
pub mod init;
pub mod layers;

pub use config::TelemetryConfig;
pub use error::TelemetryError;
pub use init::init_telemetry;

pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! Import this module to get all essential types and traits:
    //!
    //! ```rust,no_run
    //! use telemetry::prelude::*;
    //! ```

    pub use crate::config::TelemetryConfig;
    pub use crate::error::TelemetryError;
    pub use crate::init::init_telemetry;
}
