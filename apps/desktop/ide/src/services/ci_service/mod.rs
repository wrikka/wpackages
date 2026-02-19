//! # CI/CD Dashboard Service
//!
//! Service for managing CI/CD operations including
//! pipeline monitoring, failure analysis, and deployment tracking.

mod impl_;
mod trait_mod;

pub use impl_::CiServiceImpl;
pub use trait_mod::{CiResult, CiService};
