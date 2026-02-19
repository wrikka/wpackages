//! # Git Search Service
//!
//! Service for advanced Git search operations including
//! semantic search, regex, and multi-repo search.

mod impl_;
mod trait_;

pub use impl_::GitSearchServiceImpl;
pub use trait_::{GitSearchService, SearchResultType};
