//! Adapter layer
//!
//! Wrappers for external libraries to isolate dependencies.

pub mod enigo_adapter;
pub mod screenshots_adapter;
pub mod sysinfo_adapter;

// Re-export adapters
pub use enigo_adapter::*;
pub use screenshots_adapter::*;
pub use sysinfo_adapter::*;
