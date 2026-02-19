//! Integration tests for all database backends

mod common;

#[cfg(test)]
mod sqlite_tests {
    use super::*;
    use task::SQLiteTaskStore;

    async fn setup_store() -> SQLiteTaskStore {
        SQLiteTaskStore::new(":memory:").await.unwrap()
    }

    #[tokio::test]
    async fn test_sqlite_create_and_get_task() {
        let store = setup_store().await;
        common::test_create_and_get_task(&store).await;
    }

    #[tokio::test]
    async fn test_sqlite_update_task_status() {
        let store = setup_store().await;
        common::test_update_task_status(&store).await;
    }

    #[tokio::test]
    async fn test_sqlite_list_tasks() {
        let store = setup_store().await;
        common::test_list_tasks(&store).await;
    }

    #[tokio::test]
    async fn test_sqlite_delete_task() {
        let store = setup_store().await;
        common::test_delete_task(&store).await;
    }
}

#[cfg(test)]
#[cfg(feature = "postgres")]
mod postgres_tests {
    use super::*;
    use task::PostgresTaskStore;

    async fn setup_store() -> PostgresTaskStore {
        let url = std::env::var("POSTGRES_URL").unwrap_or_else(|_| {
            "postgresql://postgres:postgres@localhost:5432/task_test".to_string()
        });

        PostgresTaskStore::new(&url).await.unwrap()
    }

    #[tokio::test]
    async fn test_postgres_create_and_get_task() {
        let store = setup_store().await;
        common::test_create_and_get_task(&store).await;
    }

    #[tokio::test]
    async fn test_postgres_update_task_status() {
        let store = setup_store().await;
        common::test_update_task_status(&store).await;
    }

    #[tokio::test]
    async fn test_postgres_list_tasks() {
        let store = setup_store().await;
        common::test_list_tasks(&store).await;
    }
}

#[cfg(test)]
#[cfg(feature = "mysql")]
mod mysql_tests {
    use super::*;
    use task::MySQLTaskStore;

    async fn setup_store() -> MySQLTaskStore {
        let url = std::env::var("MYSQL_URL")
            .unwrap_or_else(|_| "mysql://root:root@localhost:3306/task_test".to_string());

        MySQLTaskStore::new(&url).await.unwrap()
    }

    #[tokio::test]
    async fn test_mysql_create_and_get_task() {
        let store = setup_store().await;
        common::test_create_and_get_task(&store).await;
    }

    #[tokio::test]
    async fn test_mysql_update_task_status() {
        let store = setup_store().await;
        common::test_update_task_status(&store).await;
    }

    #[tokio::test]
    async fn test_mysql_list_tasks() {
        let store = setup_store().await;
        common::test_list_tasks(&store).await;
    }
}

#[cfg(test)]
#[cfg(feature = "redis")]
mod redis_tests {
    use super::*;
    use task::RedisTaskStore;

    async fn setup_store() -> RedisTaskStore {
        let url =
            std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".to_string());

        RedisTaskStore::new(&url).await.unwrap()
    }

    #[tokio::test]
    async fn test_redis_create_and_get_task() {
        let store = setup_store().await;
        common::test_create_and_get_task(&store).await;
    }

    #[tokio::test]
    async fn test_redis_update_task_status() {
        let store = setup_store().await;
        common::test_update_task_status(&store).await;
    }

    #[tokio::test]
    async fn test_redis_list_tasks() {
        let store = setup_store().await;
        common::test_list_tasks(&store).await;
    }
}

#[cfg(test)]
mod feature_integration_tests {
    use super::*;
    use task::{
        CancellationManager, RateLimiter, RetryPolicy, TaskDeduplicator, TaskExecutor,
        TaskPriorityQueue,
    };

    #[tokio::test]
    async fn test_task_executor_with_retry() {
        let executor = TaskExecutor::new(RetryPolicy::new(3));
        let task = Task::new("test-task").with_retries(3);

        let mut attempt = 0;
        let handler = || {
            attempt += 1;
            async move {
                if attempt < 2 {
                    Err(task::TaskError::Other("Simulated error".to_string()))
                } else {
                    Ok(serde_json::json!({ "result": "success" }))
                }
            }
        };

        let (updated_task, result) = executor.execute_task(task, handler).await;
        assert_eq!(updated_task.status, TaskStatus::Completed);
        assert!(result.success);
    }

    #[tokio::test]
    async fn test_priority_queue() {
        let mut queue = TaskPriorityQueue::new();

        queue
            .push(Task::new("low").with_priority(TaskPriority::Low))
            .unwrap();
        queue
            .push(Task::new("critical").with_priority(TaskPriority::Critical))
            .unwrap();
        queue
            .push(Task::new("normal").with_priority(TaskPriority::Normal))
            .unwrap();

        let first = queue.pop().unwrap();
        assert_eq!(first.priority, TaskPriority::Critical);

        let second = queue.pop().unwrap();
        assert_eq!(second.priority, TaskPriority::Normal);

        let third = queue.pop().unwrap();
        assert_eq!(third.priority, TaskPriority::Low);
    }

    #[tokio::test]
    async fn test_cancellation_manager() {
        let manager = CancellationManager::new();
        let task_id = "test-task".to_string();

        let token = manager.register_task(task_id.clone()).await;
        assert!(!manager.is_cancelled(&task_id).await);

        manager.cancel_task(&task_id).await.unwrap();
        assert!(manager.is_cancelled(&task_id).await);
    }

    #[tokio::test]
    async fn test_rate_limiter() {
        let limiter = RateLimiter::new(5, 10);

        for _ in 0..5 {
            assert!(limiter.try_acquire("test", 1).await);
        }

        assert!(!limiter.try_acquire("test", 1).await);
    }

    #[tokio::test]
    async fn test_task_deduplicator() {
        let deduplicator = TaskDeduplicator::new(100);

        let task1 = Task::new("test-task").with_priority(TaskPriority::High);
        let task2 = Task::new("test-task").with_priority(TaskPriority::High);

        assert!(!deduplicator.is_duplicate(&task1).await);
        deduplicator.register(&task1).await;
        assert!(deduplicator.is_duplicate(&task2).await);
    }
}
