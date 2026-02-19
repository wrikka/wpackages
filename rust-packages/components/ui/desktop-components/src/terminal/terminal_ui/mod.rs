//! Terminal UI component

// Module declarations
pub mod error;
pub mod pty;
pub mod types;
pub mod view;

// Public API exports
pub use self::error::{TerminalError, TerminalResult};
pub use self::pty::{PtyService, TerminalSession};
pub use self::types::{TerminalShell, TerminalState, TerminalTab};
pub use self::view::{show, TerminalAction};
