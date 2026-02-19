//! Service layer (Effect Layer)
//!
//! This module contains all I/O operations and side effects.
//! Services implement traits defined in the components layer.

pub mod automation;
pub mod clipboard;
pub mod handlers;
pub mod ipc;
pub mod mouse;
pub mod keyboard;
pub mod process;
pub mod recording;
pub mod screen;
pub mod vision;

// Re-export services
pub use automation::*;
pub use clipboard::*;
pub use ipc::*;
pub use mouse::*;
pub use keyboard::*;
pub use process::*;
pub use recording::*;
pub use screen::*;
pub use vision::*;
