//! Defines the memory graph and relationship types.

use std::collections::{HashMap, HashSet};
use crate::models::MemoryId;

/// Represents the type of relationship between two memories.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Relationship {
    /// A follows B in a sequence.
    Temporal(MemoryId, MemoryId),
    /// A is conceptually related to B.
    Related(MemoryId, MemoryId),
    /// A causes B.
    Causal(MemoryId, MemoryId),
}

/// A graph structure representing relationships between memories.
#[derive(Debug, Default)]
pub struct MemoryGraph {
    adj: HashMap<MemoryId, HashSet<MemoryId>>,
    // We could store edge properties (like Relationship type) here if needed.
}

impl MemoryGraph {
    pub fn new() -> Self {
        Self::default()
    }

    /// Adds a node to the graph. This is implicitly done when adding an edge.
    fn add_node(&mut self, id: MemoryId) {
        self.adj.entry(id).or_default();
    }

    /// Adds a directed edge from one memory to another.
    pub fn add_edge(&mut self, from: MemoryId, to: MemoryId) {
        self.add_node(from);
        self.add_node(to);
        if let Some(neighbors) = self.adj.get_mut(&from) {
            neighbors.insert(to);
        }
    }

    /// Gets the neighbors of a given memory node.
    pub fn get_neighbors(&self, id: &MemoryId) -> Option<&HashSet<MemoryId>> {
        self.adj.get(id)
    }
}
