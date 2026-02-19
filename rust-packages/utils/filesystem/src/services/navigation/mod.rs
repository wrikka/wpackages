pub mod client;
pub mod error;
pub mod reference;
pub mod symbol;
pub mod types;

pub use client::NavigationClient;
pub use error::{NavigationError, NavigationResult};
pub use reference::Reference;
pub use symbol::Symbol;
pub use types::{
    NavigationBookmarks, NavigationHistory, NavigationHistoryEntry, NavigationOptions,
    NavigationTarget,
};
