//! Simple memory systems
//!
//! Provides straightforward long-term and working memory implementations
//! that don't require complex vector indexing or graph structures.

use anyhow::Result;
use lru::LruCache;
use serde::{Deserialize, Serialize};
use sled::Db;
use std::collections::HashMap;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SimpleMemoryError {
    #[error("Memory operation failed")]
    OperationFailed,
    #[error("Memory not found: {0}")]
    NotFound(String),
    #[error("Database error: {0}")]
    Database(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
}

impl From<sled::Error> for SimpleMemoryError {
    fn from(e: sled::Error) -> Self {
        SimpleMemoryError::Database(e.to_string())
    }
}

impl From<serde_json::Error> for SimpleMemoryError {
    fn from(e: serde_json::Error) -> Self {
        SimpleMemoryError::Serialization(e.to_string())
    }
}

impl From<std::io::Error> for SimpleMemoryError {
    fn from(e: std::io::Error) -> Self {
        SimpleMemoryError::OperationFailed
    }
}

/// Long-term memory system using sled database
pub struct LongTermMemory {
    db: Db,
    cache: LruCache<String, MemoryEntry>,
}

impl LongTermMemory {
    /// Create a new long-term memory with default path
    pub fn new() -> Result<Self, SimpleMemoryError> {
        Self::with_path("memory_db")
    }

    /// Create a new long-term memory with custom path
    pub fn with_path(path: &str) -> Result<Self, SimpleMemoryError> {
        let db = sled::open(path)?;
        let cache = LruCache::new(std::num::NonZeroUsize::new(1000).unwrap());
        Ok(Self { db, cache })
    }

    /// Store a memory entry
    pub fn store(&mut self, entry: MemoryEntry) -> Result<(), SimpleMemoryError> {
        let key = entry.id.clone();
        let value = serde_json::to_vec(&entry)?;
        self.db.insert(key.as_bytes(), value)?;
        self.db.flush()?;
        self.cache.put(key.clone(), entry);
        Ok(())
    }

    /// Retrieve a memory entry by ID
    pub fn get(&mut self, id: &str) -> Result<Option<MemoryEntry>, SimpleMemoryError> {
        // Check cache first
        if let Some(entry) = self.cache.get(id) {
            return Ok(Some(entry.clone()));
        }

        // Check database
        if let Some(data) = self.db.get(id)? {
            let entry: MemoryEntry = serde_json::from_slice(&data)?;
            self.cache.put(id.to_string(), entry.clone());
            return Ok(Some(entry));
        }

        Ok(None)
    }

    /// Search memory entries by content
    pub fn search(&mut self, query: &str) -> Result<Vec<MemoryEntry>, SimpleMemoryError> {
        let mut results = vec![];
        let query_lower = query.to_lowercase();

        // Search in cache first
        for (_, entry) in self.cache.iter() {
            if entry.content.to_lowercase().contains(&query_lower)
                || entry.tags.iter().any(|tag| tag.to_lowercase().contains(&query_lower))
            {
                results.push(entry.clone());
            }
        }

        // Search in database
        for item in self.db.iter() {
            let (_, value) = item.map_err(|e| SimpleMemoryError::Database(e.to_string()))?;
            if let Ok(entry) = serde_json::from_slice::<MemoryEntry>(&value) {
                // Skip if already in results from cache
                if results.iter().any(|e| e.id == entry.id) {
                    continue;
                }
                if entry.content.to_lowercase().contains(&query_lower)
                    || entry.tags.iter().any(|tag| tag.to_lowercase().contains(&query_lower))
                {
                    results.push(entry);
                }
            }
        }

        Ok(results)
    }

    /// Update an existing memory entry
    pub fn update(&mut self, entry: MemoryEntry) -> Result<(), SimpleMemoryError> {
        if !self.db.contains_key(entry.id.as_bytes())? {
            return Err(SimpleMemoryError::NotFound(entry.id.clone()));
        }
        self.store(entry)
    }

    /// Delete a memory entry
    pub fn delete(&mut self, id: &str) -> Result<(), SimpleMemoryError> {
        self.db.remove(id)?;
        self.db.flush()?;
        self.cache.pop(id);
        Ok(())
    }

    /// Get all memory entries (use with caution on large databases)
    pub fn get_all(&self) -> Result<Vec<MemoryEntry>, SimpleMemoryError> {
        let mut results = vec![];
        for item in self.db.iter() {
            let (_, value) = item.map_err(|e| SimpleMemoryError::Database(e.to_string()))?;
            if let Ok(entry) = serde_json::from_slice::<MemoryEntry>(&value) {
                results.push(entry);
            }
        }
        Ok(results)
    }

    /// Get entry count
    pub fn count(&self) -> usize {
        self.db.len()
    }

    /// Clear all entries
    pub fn clear(&self) -> Result<(), SimpleMemoryError> {
        self.db.clear()?;
        self.db.flush()?;
        Ok(())
    }
}

impl Drop for LongTermMemory {
    fn drop(&mut self) {
        let _ = self.db.flush();
    }
}

/// Short-term working memory for session context
pub struct WorkingMemory {
    context: SessionContext,
    task_states: HashMap<String, TaskState>,
    attention_focus: Option<String>,
    data: HashMap<String, serde_json::Value>,
}

impl WorkingMemory {
    /// Create a new working memory
    pub fn new() -> Self {
        Self {
            context: SessionContext::default(),
            task_states: HashMap::new(),
            attention_focus: None,
            data: HashMap::new(),
        }
    }

    /// Store session context
    pub fn set_context(&mut self, context: SessionContext) {
        self.context = context;
    }

    /// Get session context
    pub fn get_context(&self) -> &SessionContext {
        &self.context
    }

    /// Track task state
    pub fn set_task_state(&mut self, task_id: String, state: TaskState) {
        self.task_states.insert(task_id, state);
    }

    /// Get task state
    pub fn get_task_state(&self, task_id: &str) -> Option<&TaskState> {
        self.task_states.get(task_id)
    }

    /// Get all task states
    pub fn get_all_task_states(&self) -> &HashMap<String, TaskState> {
        &self.task_states
    }

    /// Set attention focus
    pub fn set_focus(&mut self, focus: String) {
        self.attention_focus = Some(focus);
    }

    /// Get attention focus
    pub fn get_focus(&self) -> Option<&String> {
        self.attention_focus.as_ref()
    }

    /// Clear attention focus
    pub fn clear_focus(&mut self) {
        self.attention_focus = None;
    }

    /// Store arbitrary data
    pub fn set_data(&mut self, key: String, value: serde_json::Value) {
        self.data.insert(key, value);
    }

    /// Get data
    pub fn get_data(&self, key: &str) -> Option<&serde_json::Value> {
        self.data.get(key)
    }

    /// Remove data
    pub fn remove_data(&mut self, key: &str) -> Option<serde_json::Value> {
        self.data.remove(key)
    }

    /// Clear all data
    pub fn clear_data(&mut self) {
        self.data.clear();
    }

    /// Clear all task states
    pub fn clear_task_states(&mut self) {
        self.task_states.clear();
    }

    /// Reset working memory
    pub fn reset(&mut self) {
        self.context = SessionContext::default();
        self.task_states.clear();
        self.attention_focus = None;
        self.data.clear();
    }
}

impl Default for WorkingMemory {
    fn default() -> Self {
        Self::new()
    }
}

/// Memory entry for long-term storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub created_at: chrono::DateTime<chrono::Utc>,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

impl MemoryEntry {
    /// Create a new memory entry
    pub fn new(content: impl Into<String>) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            content: content.into(),
            created_at: now,
            updated_at: now,
            tags: Vec::new(),
            metadata: HashMap::new(),
        }
    }

    /// Add tags
    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }

    /// Add metadata
    pub fn with_metadata(mut self, key: String, value: serde_json::Value) -> Self {
        self.metadata.insert(key, value);
        self
    }

    /// Update content
    pub fn update_content(&mut self, content: impl Into<String>) {
        self.content = content.into();
        self.updated_at = chrono::Utc::now();
    }
}

/// Session context for working memory
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SessionContext {
    pub user_id: Option<String>,
    pub session_id: String,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub elements: Vec<String>,
}

impl SessionContext {
    /// Create a new session context
    pub fn new() -> Self {
        Self {
            user_id: None,
            session_id: uuid::Uuid::new_v4().to_string(),
            start_time: chrono::Utc::now(),
            elements: Vec::new(),
        }
    }

    /// Set user ID
    pub fn with_user(mut self, user_id: impl Into<String>) -> Self {
        self.user_id = Some(user_id.into());
        self
    }

    /// Add element
    pub fn add_element(&mut self, element: impl Into<String>) {
        self.elements.push(element.into());
    }
}

/// Task state for tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskState {
    pub status: TaskStatus,
    pub progress: f32,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub last_update: chrono::DateTime<chrono::Utc>,
    pub message: Option<String>,
}

impl TaskState {
    /// Create new pending task
    pub fn pending() -> Self {
        Self {
            status: TaskStatus::Pending,
            progress: 0.0,
            last_update: chrono::Utc::now(),
            message: None,
        }
    }

    /// Create in-progress task
    pub fn in_progress(progress: f32) -> Self {
        Self {
            status: TaskStatus::InProgress,
            progress: progress.clamp(0.0, 1.0),
            last_update: chrono::Utc::now(),
            message: None,
        }
    }

    /// Create completed task
    pub fn completed() -> Self {
        Self {
            status: TaskStatus::Completed,
            progress: 1.0,
            last_update: chrono::Utc::now(),
            message: Some("Completed".to_string()),
        }
    }

    /// Create failed task
    pub fn failed(message: impl Into<String>) -> Self {
        Self {
            status: TaskStatus::Failed,
            progress: 0.0,
            last_update: chrono::Utc::now(),
            message: Some(message.into()),
        }
    }

    /// Update progress
    pub fn set_progress(&mut self, progress: f32) {
        self.progress = progress.clamp(0.0, 1.0);
        self.last_update = chrono::Utc::now();
        if self.progress >= 1.0 && self.status != TaskStatus::Completed {
            self.status = TaskStatus::Completed;
        }
    }

    /// Set message
    pub fn set_message(&mut self, message: impl Into<String>) {
        self.message = Some(message.into());
        self.last_update = chrono::Utc::now();
    }
}

/// Task status enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

impl std::fmt::Display for TaskStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TaskStatus::Pending => write!(f, "Pending"),
            TaskStatus::InProgress => write!(f, "In Progress"),
            TaskStatus::Completed => write!(f, "Completed"),
            TaskStatus::Failed => write!(f, "Failed"),
        }
    }
}
