//! UI components for TUI Rust

pub mod chat_panel;
pub mod command_palette;
pub mod component;
pub mod file_explorer;
pub mod input_field;
pub mod output_display;
pub mod status_bar;
pub mod theme;

// Re-exports
pub use chat_panel::ChatPanel;
pub use command_palette::{Command, CommandCategory, CommandPalette};
pub use component::{Renderable, Scrollable, Selectable, Themed, Toggleable};
pub use file_explorer::FileExplorer;
pub use input_field::InputField;
pub use output_display::OutputDisplay;
pub use status_bar::StatusBar;
pub use theme::{FileType, TextContext, Theme};
