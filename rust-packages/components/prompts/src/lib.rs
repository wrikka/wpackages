//! # Prompt
//! 
//! A powerful CLI prompt library for Rust - better than clack.
//! 
//! ## Features
//! 
//! - **Type-safe prompts**: Generic returns with automatic deserialization
//! - **Async-native**: First-class async/await support
//! - **Rich UI**: Spinners, progress bars, live preview
//! - **Intelligent validation**: Sync and async validators with live feedback
//! - **Form/Wizard**: Declarative multi-step forms with branching
//! - **Auto-completion**: Fuzzy matching with custom sources
//! - **Undo/History**: Full session history with Ctrl+Z support
//! - **Template strings**: Dynamic message content
//! - **Multi-platform**: Windows, macOS, Linux, WASM
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! use prompt::{text, confirm, select, Result};
//!
//! #[tokio::main]
//! async fn main() -> Result<()> {
//!     let name: String = text("What's your name?")
//!         .placeholder("Anonymous")
//!         .validate(|v| v.len() >= 2)
//!         .interact()
//!         .await?;
//!
//!     let ok: bool = confirm("Continue?").interact().await?;
//!
//!     let lang = select("Favorite language?")
//!         .options(["Rust", "TypeScript", "Go"])
//!         .interact()
//!         .await?;
//!
//!     Ok(())
//! }
//! ```

pub mod error;
pub mod theme;
pub mod prompt;
pub mod validation;
pub mod history;
pub mod completion;
pub mod spinner;
pub mod form;
pub mod template;
pub mod keybind;
pub mod render;
pub mod event;

// Re-exports
pub use error::{Error, Result};
pub use theme::{Theme, ColorScheme, SymbolSet};
pub use prompt::{
    text, password, confirm, select, multi_select, 
    number, editor, path, auto_complete, 
    Text, Password, Confirm, Select, MultiSelect, 
    Number, Editor, PathPrompt, AutoComplete
};
pub use validation::{Validator, ValidationError};
pub use history::History;
pub use completion::{CompletionSource, FuzzyMatcher};
pub use spinner::{Spinner, ProgressBar, TaskGroup};
pub use form::{Form, Field, FieldType, Wizard};
pub use template::render_template;
pub use keybind::{Keybinding, Keymap, KeyAction};
pub use render::{RenderEngine, TerminalRenderer};

/// Version of the library
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
