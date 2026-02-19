//! # TUI Command Palette
//!
//! Command palette component for TUI applications.

pub mod app;
pub mod input;
pub mod state;
pub mod ui;

pub use app::*;
pub use input::*;
pub use state::*;
pub use ui::*;

pub mod prelude {
    pub use crate::app::App;
    pub use crate::input::InputMode;
    pub use crate::state::AppState;
}
