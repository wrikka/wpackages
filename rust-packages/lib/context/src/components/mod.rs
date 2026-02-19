//! Pure domain logic components for context analysis
//!
//! This module contains pure functions that perform context analysis without side effects.

pub mod dependency_parser;
pub mod framework_detector;
pub mod language_detector;
pub mod package_detector;

pub use dependency_parser::*;
pub use framework_detector::*;
pub use language_detector::*;
pub use package_detector::*;
