//! The main orchestrator for the memory system.

use crate::config::MemorySystemConfig;
use crate::consolidation::Summarizer;
use crate::decay::DecayStrategy;
use crate::error::MemorySystemError;
use crate::graph::MemoryGraph;
use crate::index::VectorIndex;
use crate::models::{Embedding, Emotion, Memory, MemoryContent, MemoryId};
use crate::store::MemoryStore;
use crate::utils::cosine_similarity;


/// The high-level API for the AI Memory system.
/// It orchestrates the store, index, and decay components.
pub struct MemorySystem {
    store: Box<dyn MemoryStore>,
    index: Box<dyn VectorIndex>,
    graph: MemoryGraph,
    config: MemorySystemConfig,
    next_id: MemoryId,
}

impl MemorySystem {
    /// Creates a new MemorySystem with the given store and index implementations.
    pub fn new(store: Box<dyn MemoryStore>, index: Box<dyn VectorIndex>, config: MemorySystemConfig) -> Self {
        Self {
            store,
            index,
            graph: MemoryGraph::new(),
            config,
            next_id: 0, // In a real system, this should be loaded from the store
        }
    }

        /// Adds a new memory to the system.
    pub fn add_memory(
        &mut self,
        content: MemoryContent,
        embedding: Embedding,
        emotion: Option<Emotion>,
    ) -> Result<MemoryId, MemorySystemError> {
        let id = self.next_id;
        let memory = Memory::new(id, content, embedding, emotion)
            .map_err(|e| MemorySystemError::TimeError(e.to_string()))?;
        self.index.add(id, &memory.embedding);
        self.store.add(memory);
        self.next_id += 1;

        // A simple temporal link to the previously added memory.
        if id > 0 {
            self.graph.add_edge(id, id - 1);
        }
        Ok(id)
    }

    /// Retrieves a memory by its ID, also reinforcing its strength.
    pub fn get_memory(&mut self, id: &MemoryId) -> Result<&Memory, MemorySystemError> {
        let memory = self
            .store
            .get_mut(id)
            .ok_or(MemorySystemError::MemoryNotFound)?;

        memory
            .touch()
            .map_err(|e| MemorySystemError::TimeError(e.to_string()))?;

        // Re-borrow as immutable.
        self.store.get(id).ok_or(MemorySystemError::MemoryNotFound)
    }

    /// Performs a context-aware semantic search.
    pub fn search(
        &self,
        query_embedding: &Embedding,
        top_k: usize,
        context_id: Option<MemoryId>,
    ) -> Result<Vec<(&Memory, f32)>, MemorySystemError> {
        let candidate_ids = self.index.query(query_embedding);

        let context_neighbors = context_id
            .and_then(|id| self.graph.get_neighbors(&id))
            .cloned()
            .unwrap_or_default();

        let mut candidates_with_scores: Vec<(&Memory, f32)> = candidate_ids
            .iter()
            .filter_map(|id| self.store.get(id))
            .filter_map(|memory| {
                let similarity_score = match cosine_similarity(&memory.embedding, query_embedding) {
                    Ok(score) => score,
                    Err(_) => return None, // Skip if similarity calculation fails
                };

                let graph_score = if context_neighbors.contains(&memory.id) {
                    self.config.graph_boost
                } else {
                    0.0
                };

                let final_score =
                    (self.config.w_similarity * similarity_score) + (self.config.w_graph * graph_score);
                Some((memory, final_score))
            })
            .collect();

        candidates_with_scores
            .sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        Ok(candidates_with_scores.into_iter().take(top_k).collect())
    }

    /// Applies a decay strategy to the memories in the store.
    pub fn apply_decay(&mut self, strategy: &dyn DecayStrategy) -> Result<(), MemorySystemError> {
        strategy.apply(self.store.as_mut())?;
        Ok(())
    }

    /// Adds a directed relationship from one memory to another.
        pub fn add_relationship(&mut self, from: MemoryId, to: MemoryId) {
        self.graph.add_edge(from, to);
    }

    /// Consolidates a cluster of memories around a central memory into a new abstract memory.
    pub fn consolidate(
        &mut self,
        central_memory_id: MemoryId,
        summarizer: Summarizer,
    ) -> Result<MemoryId, MemorySystemError> {
        let central_memory = self
            .store
            .get(&central_memory_id)
            .ok_or(MemorySystemError::MemoryNotFound)?
            .clone();

        let cluster_ids: Vec<MemoryId> = self
            .store
            .iter()
            .filter_map(|mem| {
                cosine_similarity(&mem.embedding, &central_memory.embedding)
                    .ok()
                    .filter(|&score| score > self.config.consolidation_threshold)
                    .map(|_| mem.id)
            })
            .collect();

        if cluster_ids.len() <= 1 {
            return Err(MemorySystemError::InvalidOperation(
                "Not enough memories to consolidate".to_string(),
            ));
        }

        let contents_to_summarize: Vec<MemoryContent> = cluster_ids
            .iter()
            .filter_map(|id| self.store.get(id))
            .map(|mem| mem.content.clone())
            .collect();

        let (new_content, new_embedding, new_emotion) = summarizer(&contents_to_summarize);

        let abstract_memory_id = self.add_memory(new_content, new_embedding, new_emotion)?;

        for &id in &cluster_ids {
            self.graph.add_edge(abstract_memory_id, id);
        }

        Ok(abstract_memory_id)
    }
}

