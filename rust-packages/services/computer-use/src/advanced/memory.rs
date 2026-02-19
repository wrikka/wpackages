//! Features 11-12: Memory Systems
//! 
//! Feature 11: Long-Term Memory System
//! - Stores task, workflow, and pattern information
//! - Retrieves relevant experiences from memory
//! - Updates memory with new learnings
//!
//! Feature 12: Short-Term Working Memory
//! - Stores context of current session
//! - Tracks state of ongoing tasks
//! - Manages attention and focus

use anyhow::Result;
use lru::LruCache;
use sled::{Db, Tree};
use std::collections::HashMap;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum MemoryError {
    #[error("Memory operation failed")]
    OperationFailed,
    #[error("Memory not found")]
    NotFound,
}

/// Long-term memory system using sled database
pub struct LongTermMemory {
    db: Db,
    cache: LruCache<String, MemoryEntry>,
}

impl LongTermMemory {
    pub fn new() -> Result<Self> {
        let db = sled::open("computer_use_memory")?;
        let cache = LruCache::new(1000usize);
        Ok(Self { db, cache })
    }

    /// Store task, workflow, and pattern information
    pub fn store(&mut self, entry: MemoryEntry) -> Result<()> {
        let key = entry.id.clone();
        let value = serde_json::to_vec(&entry)?;
        self.db.insert(key.as_bytes(), value)?;
        self.cache.put(key.clone(), entry.clone());
        Ok(())
    }

    /// Retrieve relevant experiences from memory
    pub fn retrieve(&mut self, query: &str) -> Result<Vec<MemoryEntry>> {
        let mut results = vec![];

        // Search in cache first
        for (_, entry) in self.cache.iter() {
            if entry.content.contains(query) {
                results.push(entry.clone());
            }
        }

        // Search in database
        for item in self.db.iter() {
            let (_, value) = item?;
            if let Ok(entry) = serde_json::from_slice::<MemoryEntry>(&value) {
                if entry.content.contains(query) {
                    results.push(entry);
                }
            }
        }

        Ok(results)
    }

    /// Update memory with new learnings
    pub fn update(&mut self, entry: MemoryEntry) -> Result<()> {
        self.store(entry)
    }
}

/// Short-term working memory
pub struct WorkingMemory {
    context: SessionContext,
    task_states: HashMap<String, TaskState>,
    attention_focus: Option<String>,
}

impl WorkingMemory {
    pub fn new() -> Self {
        Self {
            context: SessionContext::default(),
            task_states: HashMap::new(),
            attention_focus: None,
        }
    }

    /// Store context of current session
    pub fn store_context(&mut self, context: SessionContext) {
        self.context = context;
    }

    /// Track state of ongoing tasks
    pub fn track_task(&mut self, task_id: String, state: TaskState) {
        self.task_states.insert(task_id, state);
    }

    /// Manage attention and focus
    pub fn set_focus(&mut self, focus: String) {
        self.attention_focus = Some(focus);
    }

    /// Get current context
    pub fn get_context(&self) -> &SessionContext {
        &self.context
    }

    /// Get task state
    pub fn get_task_state(&self, task_id: &str) -> Option<&TaskState> {
        self.task_states.get(task_id)
    }
}

#[derive(Debug, Clone)]
pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub timestamp: std::time::Instant,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Default)]
pub struct SessionContext {
    pub user_id: Option<String>,
    pub session_id: String,
    pub start_time: std::time::Instant,
    pub elements: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct TaskState {
    pub status: TaskStatus,
    pub progress: f32,
    pub last_update: std::time::Instant,
}

#[derive(Debug, Clone)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_long_term_memory() {
        let mut memory = LongTermMemory::new().expect("Failed to create LongTermMemory");
        let entry = MemoryEntry {
            id: "test1".to_string(),
            content: "Test content".to_string(),
            timestamp: std::time::Instant::now(),
            tags: vec!["test".to_string()],
        };
        memory.store(entry).expect("Failed to store memory entry");
        let results = memory.retrieve("test").expect("Failed to retrieve memory entries");
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_working_memory() {
        let mut memory = WorkingMemory::new();
        let context = SessionContext::default();
        memory.store_context(context);
        assert!(memory.get_context().session_id.is_empty());
    }
}
