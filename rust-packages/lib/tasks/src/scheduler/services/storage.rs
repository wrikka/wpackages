//! Storage for scheduled tasks

use crate::types::ScheduledTask;
use crate::Result;
use crate::SchedulerError;
use queue::TaskId;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Storage for scheduled tasks
pub trait SchedulerStorage: Send + Sync {
    /// Add a scheduled task
    fn add(&mut self, task: ScheduledTask) -> Result<()>;

    /// Get a scheduled task by ID
    fn get(&self, task_id: &TaskId) -> Option<ScheduledTask>;

    /// Get all scheduled tasks
    fn get_all(&self) -> Vec<ScheduledTask>;

    /// Update a scheduled task
    fn update(&mut self, task: ScheduledTask) -> Result<()>;

    /// Remove a scheduled task
    fn remove(&mut self, task_id: &TaskId) -> Result<()>;

    /// Get tasks that should run now
    fn get_due_tasks(&self) -> Vec<ScheduledTask>;

    /// Clear all tasks
    fn clear(&mut self);
}

/// In-memory storage for scheduled tasks
#[derive(Debug)]
pub struct InMemoryStorage {
    tasks: HashMap<TaskId, ScheduledTask>,
}

impl InMemoryStorage {
    pub fn new() -> Self {
        InMemoryStorage {
            tasks: HashMap::new(),
        }
    }
}

impl Default for InMemoryStorage {
    fn default() -> Self {
        Self::new()
    }
}

impl SchedulerStorage for InMemoryStorage {
    fn add(&mut self, task: ScheduledTask) -> Result<()> {
        let task_id = task.task.id.clone();
        self.tasks.insert(task_id, task);
        Ok(())
    }

    fn get(&self, task_id: &TaskId) -> Option<ScheduledTask> {
        self.tasks.get(task_id).cloned()
    }

    fn get_all(&self) -> Vec<ScheduledTask> {
        self.tasks.values().cloned().collect()
    }

    fn update(&mut self, task: ScheduledTask) -> Result<()> {
        let task_id = task.task.id.clone();
        if !self.tasks.contains_key(&task_id) {
            return Err(crate::SchedulerError::TaskNotFound {
                task_id: task_id.clone(),
            });
        }
        self.tasks.insert(task_id, task);
        Ok(())
    }

    fn remove(&mut self, task_id: &TaskId) -> Result<()> {
        if self.tasks.remove(task_id).is_none() {
            return Err(crate::SchedulerError::TaskNotFound {
                task_id: task_id.clone(),
            });
        }
        Ok(())
    }

    fn get_due_tasks(&self) -> Vec<ScheduledTask> {
        self.tasks
            .values()
            .filter(|task: &&ScheduledTask| task.should_run())
            .cloned()
            .collect()
    }

    fn clear(&mut self) {
        self.tasks.clear();
    }
}

/// Thread-safe storage wrapper
#[derive(Clone)]
pub struct ThreadSafeStorage {
    inner: Arc<Mutex<dyn SchedulerStorage>>,
}

impl ThreadSafeStorage {
    pub fn new(storage: impl SchedulerStorage + 'static) -> Self {
        ThreadSafeStorage {
            inner: Arc::new(Mutex::new(storage)),
        }
    }

    pub fn add(&self, task: ScheduledTask) -> Result<()> {
        let mut storage = self.inner.lock().unwrap();
        storage.add(task)
    }

    pub fn get(&self, task_id: &TaskId) -> Option<ScheduledTask> {
        let storage = self.inner.lock().unwrap();
        storage.get(task_id)
    }

    pub fn get_all(&self) -> Vec<ScheduledTask> {
        let storage = self.inner.lock().unwrap();
        storage.get_all()
    }

    pub fn update(&self, task: ScheduledTask) -> Result<()> {
        let mut storage = self.inner.lock().unwrap();
        storage.update(task)
    }

    pub fn remove(&self, task_id: &TaskId) -> Result<()> {
        let mut storage = self.inner.lock().unwrap();
        storage.remove(task_id)
    }

    pub fn get_due_tasks(&self) -> Vec<ScheduledTask> {
        let storage = self.inner.lock().unwrap();
        storage.get_due_tasks()
    }

    pub fn clear(&self) {
        let mut storage = self.inner.lock().unwrap();
        storage.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Schedule;
    use queue::Task;

    #[test]
    fn test_add_get_task() {
        let mut storage = InMemoryStorage::new();
        let task = Task::new("test task");
        let scheduled = ScheduledTask::new(task, Schedule::Interval { seconds: 60 });

        storage.add(scheduled.clone()).unwrap();

        let retrieved = storage.get(&scheduled.task.id);
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().task.name, "test task");
    }

    #[test]
    fn test_update_task() {
        let mut storage = InMemoryStorage::new();
        let task = Task::new("test task");
        let mut scheduled = ScheduledTask::new(task, Schedule::Interval { seconds: 60 });

        storage.add(scheduled.clone()).unwrap();

        scheduled.mark_run();
        storage.update(scheduled.clone()).unwrap();

        let retrieved = storage.get(&scheduled.task.id);
        assert_eq!(retrieved.unwrap().run_count, 1);
    }

    #[test]
    fn test_remove_task() {
        let mut storage = InMemoryStorage::new();
        let task = Task::new("test task");
        let scheduled = ScheduledTask::new(task, Schedule::Interval { seconds: 60 });

        storage.add(scheduled.clone()).unwrap();
        storage.remove(&scheduled.task.id).unwrap();

        let retrieved = storage.get(&scheduled.task.id);
        assert!(retrieved.is_none());
    }

    #[test]
    fn test_get_due_tasks() {
        let mut storage = InMemoryStorage::new();

        // Task that should run now
        let task1 = Task::new("due task");
        let scheduled1 = ScheduledTask::new(
            task1,
            Schedule::OneTime {
                at: Utc::now() - chrono::Duration::seconds(10),
            },
        );

        // Task that should not run yet
        let task2 = Task::new("future task");
        let scheduled2 = ScheduledTask::new(
            task2,
            Schedule::OneTime {
                at: Utc::now() + chrono::Duration::seconds(100),
            },
        );

        storage.add(scheduled1).unwrap();
        storage.add(scheduled2).unwrap();

        let due_tasks = storage.get_due_tasks();
        assert_eq!(due_tasks.len(), 1);
        assert_eq!(due_tasks[0].task.name, "due task");
    }

    #[test]
    fn test_thread_safe_storage() {
        let storage = ThreadSafeStorage::new(InMemoryStorage::new());
        let task = Task::new("test task");
        let scheduled = ScheduledTask::new(task, Schedule::Interval { seconds: 60 });

        storage.add(scheduled.clone()).unwrap();

        let retrieved = storage.get(&scheduled.task.id);
        assert!(retrieved.is_some());
    }
}
