pub mod buffer;
pub mod components;
pub mod editor;
pub mod error;
pub mod history;
pub mod services;
pub mod types;

pub use buffer::TextBuffer;
pub use editor::Editor;
pub use error::{BufferError, EditorError, EditorResult, HistoryError};
pub use history::{HistoryEntry, HistoryManager, TextOperation};
pub use types::{OpenFileTab, Position, Range};
