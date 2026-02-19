//! Batching utilities for reducing draw calls
//! 
//! Provides mechanisms to batch similar operations together

use std::collections::HashMap;

/// Batch ID for grouping operations
pub type BatchId = u32;

/// Operation to be batched
#[derive(Debug, Clone)]
pub struct BatchedOperation<T> {
    pub batch_id: BatchId,
    pub operation: T,
}

/// Batcher for grouping similar operations
pub struct Batcher<T> {
    batches: HashMap<BatchId, Vec<T>>,
    next_id: BatchId,
}

impl<T> Batcher<T> {
    /// Create a new batcher
    pub fn new() -> Self {
        Self {
            batches: HashMap::new(),
            next_id: 0,
        }
    }

    /// Add an operation to a batch
    pub fn add(&mut self, batch_id: BatchId, operation: T) {
        self.batches
            .entry(batch_id)
            .or_insert_with(Vec::new)
            .push(operation);
    }

    /// Create a new batch ID
    pub fn new_batch(&mut self) -> BatchId {
        let id = self.next_id;
        self.next_id += 1;
        id
    }

    /// Get all operations for a batch
    pub fn get_batch(&self, batch_id: BatchId) -> Option<&[T]> {
        self.batches.get(&batch_id).map(|v| v.as_slice())
    }

    /// Remove a batch
    pub fn remove_batch(&mut self, batch_id: BatchId) -> Vec<T> {
        self.batches.remove(&batch_id).unwrap_or_default()
    }

    /// Clear all batches
    pub fn clear(&mut self) {
        self.batches.clear();
    }

    /// Get all batches
    pub fn all_batches(&self) -> impl Iterator<Item = (BatchId, &[T])> {
        self.batches
            .iter()
            .map(|(id, ops)| (*id, ops.as_slice()))
    }
}

impl<T> Default for Batcher<T> {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_batcher() {
        let mut batcher = Batcher::new();
        let id = batcher.new_batch();
        
        batcher.add(id, "op1".to_string());
        batcher.add(id, "op2".to_string());
        
        assert_eq!(batcher.get_batch(id).unwrap().len(), 2);
    }
}
