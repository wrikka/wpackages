pub mod fuzzy;
pub mod index;
pub mod persistence;
pub mod search;
pub mod suggestions;
pub mod utils;

// Re-export for easier access
pub use fuzzy::FuzzySearcher;
pub use persistence::PersistenceManager;
pub use search::SearchEngine;
pub use suggestions::SuggestionEngine;
