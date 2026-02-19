//! Navigation client module.
//!
//! This module provides navigation client functionality with trait definition,
//! implementation, factory functions, and tests.

pub mod factory;
pub mod impl;
pub mod tests;
pub mod trait;

// Re-export main types for convenience
pub use factory::create_navigation_client;
pub use impl::NavigationClientImpl;
pub use trait::NavigationClient;
