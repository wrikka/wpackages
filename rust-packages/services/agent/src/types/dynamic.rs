//! types/dynamic.rs

use std::any::Any;

/// A trait for components that can be dynamically loaded and managed.
pub trait DynamicComponent: Send + Sync {
    /// Returns the component as a `dyn Any` for downcasting.
    fn as_any(&self) -> &dyn Any;
}
