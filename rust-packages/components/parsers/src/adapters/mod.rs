//! Adapters for external parsing libraries
//!
//! This module provides wrappers around third-party libraries to:
//! - Abstract implementation details
//! - Provide consistent error handling
//! - Enable easier testing and mocking

pub mod html_adapter;
pub mod markdown_adapter;
pub mod pdf_adapter;

pub use html_adapter::*;
pub use markdown_adapter::*;
pub use pdf_adapter::*;
