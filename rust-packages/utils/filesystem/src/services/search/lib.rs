pub mod client;
pub mod error;
pub mod types;
pub mod matcher;
pub mod replacer;

pub use client::{SearchClient, SearchClientImpl};
pub use error::{SearchError, SearchResult};
pub use types::*;
pub use matcher::{Matcher, RegexMatcher, PlainMatcher};
pub use replacer::{Replacer, ReplacerResult};
