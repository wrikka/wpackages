//! Task deduplication using hash-based approach

use crate::error::{Result, TaskError};
use crate::store::TaskStore;
use crate::types::Task;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, warn};

/// Task deduplication manager
pub struct TaskDeduplicator {
    seen_hashes: Arc<RwLock<HashSet<String>>>,
    hash_window_size: usize,
}

impl TaskDeduplicator {
    /// Create a new task deduplicator
    pub fn new(hash_window_size: usize) -> Self {
        Self {
            seen_hashes: Arc::new(RwLock::new(HashSet::new())),
            hash_window_size,
        }
    }

    /// Create a deduplicator with default window size (1000)
    pub fn with_defaults() -> Self {
        Self::new(1000)
    }

    /// Compute hash for a task
    pub fn compute_hash(&self, task: &Task) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();

        // Hash task properties that define uniqueness
        task.name.hash(&mut hasher);
        task.priority.hash(&mut hasher);
        task.metadata.to_string().hash(&mut hasher);

        if let Some(cron_expr) = &task.cron_expression {
            cron_expr.hash(&mut hasher);
        }

        if let Some(scheduled_at) = &task.scheduled_at {
            scheduled_at.timestamp().hash(&mut hasher);
        }

        format!("{:x}", hasher.finish())
    }

    /// Check if a task is a duplicate
    pub async fn is_duplicate(&self, task: &Task) -> bool {
        let hash = self.compute_hash(task);
        let seen_hashes = self.seen_hashes.read().await;
        seen_hashes.contains(&hash)
    }

    /// Register a task as seen
    pub async fn register(&self, task: &Task) {
        let hash = self.compute_hash(task);
        let mut seen_hashes = self.seen_hashes.write().await;

        // Enforce window size
        if seen_hashes.len() >= self.hash_window_size {
            // Remove oldest entries (simplified - in production use LRU)
            let excess = seen_hashes.len() - self.hash_window_size + 1;
            let to_remove: Vec<_> = seen_hashes.iter().take(excess).cloned().collect();
            for h in to_remove {
                seen_hashes.remove(&h);
            }
        }

        seen_hashes.insert(hash);
        info!("Registered task hash: {}", hash);
    }

    /// Get count of seen hashes
    pub async fn count(&self) -> usize {
        self.seen_hashes.read().await.len()
    }

    /// Clear all seen hashes
    pub async fn clear(&self) {
        self.seen_hashes.write().await.clear();
        info!("Cleared all task hashes");
    }
}

impl Default for TaskDeduplicator {
    fn default() -> Self {
        Self::with_defaults()
    }
}

/// Task deduplication service with store integration
pub struct DeduplicationService<S: TaskStore> {
    store: S,
    deduplicator: TaskDeduplicator,
    check_store: bool,
}

impl<S: TaskStore> DeduplicationService<S> {
    /// Create a new deduplication service
    pub fn new(store: S, deduplicator: TaskDeduplicator, check_store: bool) -> Self {
        Self {
            store,
            deduplicator,
            check_store,
        }
    }

    /// Create a deduplication service with default settings
    pub fn with_defaults(store: S) -> Self {
        Self::new(store, TaskDeduplicator::with_defaults(), true)
    }

    /// Check if a task is a duplicate
    pub async fn is_duplicate(&self, task: &Task) -> bool {
        // Check in-memory cache first
        if self.deduplicator.is_duplicate(task).await {
            return true;
        }

        // Check store if enabled
        if self.check_store {
            if let Ok(Some(existing_task)) = self.store.get_task(&task.id).await {
                if self.deduplicator.compute_hash(&existing_task)
                    == self.deduplicator.compute_hash(task)
                {
                    return true;
                }
            }
        }

        false
    }

    /// Register a task
    pub async fn register(&self, task: &Task) -> Result<()> {
        self.deduplicator.register(task).await;
        Ok(())
    }

    /// Save task if not duplicate
    pub async fn save_if_unique(&self, task: &Task) -> Result<bool> {
        if self.is_duplicate(task).await {
            warn!("Task {} is a duplicate, skipping", task.id);
            return Ok(false);
        }

        self.register(task).await?;
        self.store.save_task(task).await?;
        info!("Task {} saved as unique", task.id);
        Ok(true)
    }

    /// Get deduplicator
    pub fn deduplicator(&self) -> &TaskDeduplicator {
        &self.deduplicator
    }

    /// Get store
    pub fn store(&self) -> &S {
        &self.store
    }
}

/// Deduplication strategy
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DeduplicationStrategy {
    /// No deduplication
    None,
    /// In-memory only
    Memory,
    /// Check both memory and store
    MemoryAndStore,
}

impl Default for DeduplicationStrategy {
    fn default() -> Self {
        Self::MemoryAndStore
    }
}

/// Deduplication configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeduplicationConfig {
    pub strategy: DeduplicationStrategy,
    pub hash_window_size: usize,
    pub ttl_seconds: Option<u64>,
}

impl Default for DeduplicationConfig {
    fn default() -> Self {
        Self {
            strategy: DeduplicationStrategy::default(),
            hash_window_size: 1000,
            ttl_seconds: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_hash() {
        let deduplicator = TaskDeduplicator::new(100);

        let task1 = Task::new("test-task")
            .with_priority(TaskPriority::High)
            .with_metadata(serde_json::json!({"key": "value"}));

        let task2 = Task::new("test-task")
            .with_priority(TaskPriority::High)
            .with_metadata(serde_json::json!({"key": "value"}));

        let task3 = Task::new("test-task").with_priority(TaskPriority::Normal);

        // Same tasks should have same hash
        assert_eq!(
            deduplicator.compute_hash(&task1),
            deduplicator.compute_hash(&task2)
        );

        // Different tasks should have different hash
        assert_ne!(
            deduplicator.compute_hash(&task1),
            deduplicator.compute_hash(&task3)
        );
    }

    #[tokio::test]
    async fn test_deduplicator_is_duplicate() {
        let deduplicator = TaskDeduplicator::new(100);

        let task = Task::new("test-task");

        // Initially not a duplicate
        assert!(!deduplicator.is_duplicate(&task).await);

        // Register task
        deduplicator.register(&task).await;

        // Now it's a duplicate
        assert!(deduplicator.is_duplicate(&task).await);
    }

    #[tokio::test]
    async fn test_deduplicator_window_size() {
        let deduplicator = TaskDeduplicator::new(3);

        // Add 5 tasks
        for i in 0..5 {
            deduplicator
                .register(&Task::new(&format!("task-{}", i)))
                .await;
        }

        // Should only keep 3 in window
        assert_eq!(deduplicator.count().await, 3);
    }

    #[tokio::test]
    async fn test_deduplicator_clear() {
        let deduplicator = TaskDeduplicator::new(100);

        deduplicator.register(&Task::new("task1")).await;
        deduplicator.register(&Task::new("task2")).await;

        assert_eq!(deduplicator.count().await, 2);

        deduplicator.clear().await;

        assert_eq!(deduplicator.count().await, 0);
    }

    #[test]
    fn test_deduplication_strategy_default() {
        let strategy = DeduplicationStrategy::default();
        assert_eq!(strategy, DeduplicationStrategy::MemoryAndStore);
    }

    #[test]
    fn test_deduplication_config_default() {
        let config = DeduplicationConfig::default();
        assert_eq!(config.strategy, DeduplicationStrategy::MemoryAndStore);
        assert_eq!(config.hash_window_size, 1000);
        assert!(config.ttl_seconds.is_none());
    }
}
