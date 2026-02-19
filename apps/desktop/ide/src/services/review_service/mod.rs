//! # Code Review Dashboard Service
//!
//! Service for managing code review operations including PR analysis,
//! commit insights, and quality scoring.

mod impl_;
mod trait_;

pub use impl_::ReviewServiceImpl;
pub use trait_::{ReviewResult, ReviewService};
