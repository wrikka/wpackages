//! Defines the trait for memory storage.

use std::collections::HashMap;
use crate::models::{Memory, MemoryId};

pub mod hash_map_store;

/// A trait for any memory storage implementation.
pub trait MemoryStore {
    /// Adds a new memory to the store.
    fn add(&mut self, memory: Memory);

    /// Retrieves a mutable reference to a memory by its ID.
    fn get_mut(&mut self, id: &MemoryId) -> Option<&mut Memory>;

    /// Retrieves an immutable reference to a memory by its ID.
    fn get(&self, id: &MemoryId) -> Option<&Memory>;

    /// Returns an iterator over all memories in the store.
    fn iter(&self) -> Box<dyn Iterator<Item = &Memory> + '_>;

    /// Returns a mutable iterator over all memories in the store.
    fn iter_mut(&mut self) -> Box<dyn Iterator<Item = &mut Memory> + '_>;
}
