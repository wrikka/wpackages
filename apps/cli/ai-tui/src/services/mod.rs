//! Services module
//!
//! Contains effect layer components that handle I/O operations and external
//! service interactions. All side effects are isolated in this module.

pub mod ai_service;
pub mod command_executor;
pub mod event_service;
pub mod traits;

pub use ai_service::TuiAiService;
pub use command_executor::CommandExecutor;
pub use event_service::EventHandler;
pub use traits::{EventService, FilesystemService, RealEventService, RealFilesystem};
