//! Common type bounds and aliases for the effect system
//!
//! This module provides type aliases for common trait bounds to reduce
//! verbosity and improve readability throughout the codebase.

/// Type alias for sendable types (used for success/error values)
pub type Sendable = dyn Send + 'static;

/// Type alias for thread-safe shared types (used for contexts and closures)
pub type Shareable = dyn Send + Sync + 'static;

/// Marker trait for types that can be used as effect results
pub trait EffectResultBounds: Send + 'static {}
impl<T: Send + 'static> EffectResultBounds for T {}

/// Marker trait for types that can be used as effect contexts
pub trait EffectContextBounds: Send + Sync + 'static {}
impl<T: Send + Sync + 'static> EffectContextBounds for T {}

/// Marker trait for closure types used in effects
pub trait EffectClosureBounds: Send + Sync + Clone + 'static {}
impl<T: Send + Sync + Clone + 'static> EffectClosureBounds for T {}
