//! # RVim - Modern Terminal-based Text Editor
//!
//! A fast, extensible, and modern terminal-based text editor built with Rust.
//!
//! ## Features
//!
//! - **Syntax Highlighting**: Tree-sitter powered syntax highlighting for multiple languages
//! - **LSP Integration**: Language Server Protocol support for intelligent editing
//! - **Plugin System**: Extensible plugin architecture
//! - **Multiple Selections**: Advanced multi-cursor editing
//! - **Vim Mode**: Vim-like key bindings and modal editing
//! - **AI Integration**: AI-powered code completion and assistance
//! - **Remote Development**: SSH-based remote file editing
//! - **Markdown Preview**: Live markdown preview functionality

pub mod adapters;
pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod modules;
pub mod prelude;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

// Re-export core types for easier access
pub use config::AppConfig;
pub use error::{AppError, Result};

// Re-export main components
pub use components::command_palette::{Command, CommandPalette};
pub use components::editor::{EditorState, Mode};
pub use components::file_explorer::FileExplorer;
pub use components::ui::UiRenderer;

// Re-export main services
pub use services::editor_context::EditorContext;
pub use services::keybindings::{Action, KeyBinding, KeyBindings};
pub use services::lsp::LspService;
pub use services::multi_selection::{MultiSelection, Selection};
pub use services::plugins::{PluginCommand, PluginEvent, PluginManifest, PluginSystem};
pub use services::surround::{SurroundPair, SurroundService};
pub use services::textobjects::{TextObject, TextObjectRange, TextObjectsService};
pub use services::theme::{SyntaxHighlightTheme, Theme, ThemeColor, ThemeService, UiTheme};
pub use services::tree_sitter::{SyntaxHighlight, TreeSitterService};
