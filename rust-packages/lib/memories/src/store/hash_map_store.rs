//! An in-memory implementation of the MemoryStore trait using a HashMap.

use std::collections::HashMap;
use crate::models::{Memory, MemoryId};
use super::MemoryStore;

#[derive(Debug, Default)]
pub struct HashMapMemoryStore {
    memories: HashMap<MemoryId, Memory>,
}

impl HashMapMemoryStore {
    pub fn new() -> Self {
        Self::default()
    }
}

impl MemoryStore for HashMapMemoryStore {
    fn add(&mut self, memory: Memory) {
        self.memories.insert(memory.id, memory);
    }

    fn get_mut(&mut self, id: &MemoryId) -> Option<&mut Memory> {
        self.memories.get_mut(id)
    }

    fn get(&self, id: &MemoryId) -> Option<&Memory> {
        self.memories.get(id)
    }

    fn iter(&self) -> Box<dyn Iterator<Item = &Memory> + '_> {
        Box::new(self.memories.values())
    }

    fn iter_mut(&mut self) -> Box<dyn Iterator<Item = &mut Memory> + '_> {
        Box::new(self.memories.values_mut())
    }
}
