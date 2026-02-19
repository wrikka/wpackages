//! Navigation client factory.
//!
//! This module provides factory functions for creating navigation clients
//! with different configurations.

use crate::navigation::client::impl::NavigationClientImpl;

/// Create a new navigation client with default configuration.
pub fn create_navigation_client() -> NavigationClientImpl {
    NavigationClientImpl::new()
}

/// Create a new navigation client with custom configuration.
pub fn create_navigation_client_with_config() -> NavigationClientImpl {
    NavigationClientImpl::new()
}
