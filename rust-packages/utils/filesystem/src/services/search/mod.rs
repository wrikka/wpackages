pub mod client;
pub mod error;
pub mod matcher;
pub mod replacer;
pub mod types;
pub mod utils;

pub use client::SearchClient;
pub use error::{SearchError, SearchResult};
pub use matcher::Matcher;
pub use replacer::Replacer;
pub use types::{SearchMatch, SearchOptions};
