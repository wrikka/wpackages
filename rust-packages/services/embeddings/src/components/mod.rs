//! Components Module
//!
//! Pure functions for embedding similarity calculations and transformations.

pub mod distance;
pub mod normalization;
pub mod similarity;

pub use distance::*;
pub use normalization::*;
pub use similarity::*;
