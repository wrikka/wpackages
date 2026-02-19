//! Redis implementation of TaskStore

use super::store::TaskStore;
use crate::types::{Task, TaskStatus, TaskResult};
use crate::error::{Result, TaskError};
use chrono::{DateTime, Utc};
use redis::{AsyncCommands, Client, ConnectionManager};
use serde_json;

pub struct RedisTaskStore {
    conn: ConnectionManager,
}

impl RedisTaskStore {
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = Client::open(redis_url).map_err(|e| TaskError::Other(format!("Redis connection error: {}", e)))?;
        let conn = ConnectionManager::new(client).await.map_err(|e| TaskError::Other(format!("Redis connection error: {}", e)))?;

        Ok(Self { conn })
    }

    fn task_key(task_id: &str) -> String {
        format!("task:{}", task_id)
    }

    fn result_key(task_id: &str) -> String {
        format!("task:result:{}", task_id)
    }

    fn pending_queue_key() -> &'static str {
        "task:queue:pending"
    }

    fn scheduled_queue_key() -> &'static str {
        "task:queue:scheduled"
    }

    fn status_index_key(status: TaskStatus) -> String {
        format!("task:index:status:{:?}", status)
    }

    fn priority_queue_key(priority: crate::types::TaskPriority) -> String {
        format!("task:queue:priority:{:?}", priority)
    }
}

#[async_trait::async_trait]
impl TaskStore for RedisTaskStore {
    async fn save_task(&self, task: &Task) -> Result<()> {
        let task_json = serde_json::to_string(task).map_err(TaskError::Serialization)?;
        let task_key = Self::task_key(&task.id);

        // Save task data
        let _: () = self.conn.set(&task_key, task_json).await.map_err(TaskError::Database)?;

        // Add to status index
        let status_key = Self::status_index_key(task.status);
        let _: () = self.conn.sadd(&status_key, &task.id).await.map_err(TaskError::Database)?;

        // Add to priority queue if pending
        if task.status == TaskStatus::Pending {
            let priority_key = Self::priority_queue_key(task.priority);
            let _: () = self.conn.zadd(&priority_key, &task.id, task.created_at.timestamp()).await.map_err(TaskError::Database)?;
        }

        // Add to scheduled queue if scheduled
        if let Some(scheduled_at) = task.scheduled_at {
            let score = scheduled_at.timestamp();
            let _: () = self.conn.zadd(Self::scheduled_queue_key(), &task.id, score).await.map_err(TaskError::Database)?;
        }

        Ok(())
    }

    async fn get_task(&self, task_id: &str) -> Result<Option<Task>> {
        let task_key = Self::task_key(task_id);
        let task_json: Option<String> = self.conn.get(&task_key).await.map_err(TaskError::Database)?;

        match task_json {
            Some(json) => {
                let task: Task = serde_json::from_str(&json).map_err(TaskError::Serialization)?;
                Ok(Some(task))
            }
            None => Ok(None),
        }
    }

    async fn update_task_status(&self, task_id: &str, new_status: TaskStatus) -> Result<()> {
        let task = self.get_task(task_id).await?
            .ok_or_else(|| TaskError::Other(format!("Task {} not found", task_id)))?;

        // Remove from old status index
        let old_status_key = Self::status_index_key(task.status);
        let _: () = self.conn.srem(&old_status_key, task_id).await.map_err(TaskError::Database)?;

        // Remove from priority queue if was pending
        if task.status == TaskStatus::Pending {
            let priority_key = Self::priority_queue_key(task.priority);
            let _: () = self.conn.zrem(&priority_key, task_id).await.map_err(TaskError::Database)?;
        }

        // Update task
        let mut updated_task = task;
        updated_task.status = new_status;
        self.save_task(&updated_task).await?;

        Ok(())
    }

    async fn update_task(&self, task: &Task) -> Result<()> {
        self.save_task(task).await
    }

    async fn delete_task(&self, task_id: &str) -> Result<()> {
        let task = self.get_task(task_id).await?;

        if let Some(task) = task {
            // Remove from all indexes
            let status_key = Self::status_index_key(task.status);
            let _: () = self.conn.srem(&status_key, task_id).await.map_err(TaskError::Database)?;

            if task.status == TaskStatus::Pending {
                let priority_key = Self::priority_queue_key(task.priority);
                let _: () = self.conn.zrem(&priority_key, task_id).await.map_err(TaskError::Database)?;
            }

            if task.scheduled_at.is_some() {
                let _: () = self.conn.zrem(Self::scheduled_queue_key(), task_id).await.map_err(TaskError::Database)?;
            }

            // Remove task data
            let task_key = Self::task_key(task_id);
            let _: () = self.conn.del(&task_key).await.map_err(TaskError::Database)?;

            // Remove result
            let result_key = Self::result_key(task_id);
            let _: () = self.conn.del(&result_key).await.map_err(TaskError::Database)?;
        }

        Ok(())
    }

    async fn list_tasks(&self, status: Option<TaskStatus>) -> Result<Vec<Task>> {
        let task_ids = if let Some(status) = status {
            let status_key = Self::status_index_key(status);
            let ids: Vec<String> = self.conn.smembers(&status_key).await.map_err(TaskError::Database)?;
            ids
        } else {
            // Get all task keys
            let pattern = "task:*";
            let keys: Vec<String> = self.conn.keys(pattern).await.map_err(TaskError::Database)?;
            keys.into_iter()
                .filter_map(|key| key.strip_prefix("task:").map(|s| s.to_string()))
                .collect()
        };

        let mut tasks = Vec::new();
        for task_id in task_ids {
            if let Some(task) = self.get_task(&task_id).await? {
                tasks.push(task);
            }
        }

        tasks.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(tasks)
    }

    async fn save_result(&self, result: &TaskResult) -> Result<()> {
        let result_json = serde_json::to_string(result).map_err(TaskError::Serialization)?;
        let result_key = Self::result_key(&result.task_id);

        let _: () = self.conn.set(&result_key, result_json).await.map_err(TaskError::Database)?;
        Ok(())
    }

    async fn get_result(&self, task_id: &str) -> Result<Option<TaskResult>> {
        let result_key = Self::result_key(task_id);
        let result_json: Option<String> = self.conn.get(&result_key).await.map_err(TaskError::Database)?;

        match result_json {
            Some(json) => {
                let result: TaskResult = serde_json::from_str(&json).map_err(TaskError::Serialization)?;
                Ok(Some(result))
            }
            None => Ok(None),
        }
    }

    async fn list_pending_tasks(&self) -> Result<Vec<Task>> {
        let mut tasks = Vec::new();

        // Get tasks from all priority queues, ordered by priority
        let priorities = [
            crate::types::TaskPriority::Critical,
            crate::types::TaskPriority::High,
            crate::types::TaskPriority::Normal,
            crate::types::TaskPriority::Low,
        ];

        for priority in priorities {
            let priority_key = Self::priority_queue_key(priority);
            let task_ids: Vec<String> = self.conn.zrange(&priority_key, 0, -1).await.map_err(TaskError::Database)?;

            for task_id in task_ids {
                if let Some(task) = self.get_task(&task_id).await? {
                    if task.status == TaskStatus::Pending {
                        tasks.push(task);
                    }
                }
            }
        }

        Ok(tasks)
    }

    async fn list_scheduled_tasks(&self, before: DateTime<Utc>) -> Result<Vec<Task>> {
        let score = before.timestamp();
        let task_ids: Vec<String> = self.conn
            .zrangebyscore(Self::scheduled_queue_key(), "-inf", score)
            .await
            .map_err(TaskError::Database)?;

        let mut tasks = Vec::new();
        for task_id in task_ids {
            if let Some(task) = self.get_task(&task_id).await? {
                if task.status == TaskStatus::Pending && task.scheduled_at.is_some() {
                    tasks.push(task);
                }
            }
        }

        tasks.sort_by(|a, b| a.scheduled_at.cmp(&b.scheduled_at));
        Ok(tasks)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[cfg(feature = "redis")]
    async fn test_redis_store() {
        // This test requires a running Redis instance
        // Set REDIS_URL environment variable to test
        let redis_url = std::env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1/".to_string());

        let store = RedisTaskStore::new(&redis_url).await.unwrap();

        // Test save and get
        let task = Task::new("test_task");
        store.save_task(&task).await.unwrap();

        let retrieved = store.get_task(&task.id).await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "test_task");

        // Cleanup
        store.delete_task(&task.id).await.unwrap();
    }
}
