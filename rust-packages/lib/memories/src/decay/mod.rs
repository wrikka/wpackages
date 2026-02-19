//! Defines the trait for memory decay strategies.

use crate::store::MemoryStore;

pub mod error;
pub mod exponential_decay;
pub mod spaced_repetition_decay;

pub use error::DecayError;

/// A trait for any decay strategy implementation.
pub trait DecayStrategy {
    /// Applies the decay function to all memories in a given store.
    fn apply(&self, store: &mut dyn MemoryStore) -> Result<(), DecayError>;
}
