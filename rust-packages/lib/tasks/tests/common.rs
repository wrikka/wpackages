//! Shared test helpers for integration tests

use task::{Task, TaskPriority, TaskStatus, TaskStore};

pub async fn test_create_and_get_task<S: TaskStore>(store: &S) {
    let task = Task::new("test-task").with_priority(TaskPriority::High);

    store.save_task(&task).await.unwrap();

    let retrieved = store.get_task(&task.id).await.unwrap();
    assert!(retrieved.is_some());
    assert_eq!(retrieved.unwrap().name, "test-task");
}

pub async fn test_update_task_status<S: TaskStore>(store: &S) {
    let mut task = Task::new("test-task");
    store.save_task(&task).await.unwrap();

    store
        .update_task_status(&task.id, TaskStatus::Running)
        .await
        .unwrap();

    let updated = store.get_task(&task.id).await.unwrap().unwrap();
    assert_eq!(updated.status, TaskStatus::Running);
}

pub async fn test_list_tasks<S: TaskStore>(store: &S) {
    store.save_task(&Task::new("task1")).await.unwrap();
    store.save_task(&Task::new("task2")).await.unwrap();

    let tasks = store.list_tasks(None).await.unwrap();
    assert_eq!(tasks.len(), 2);
}

pub async fn test_delete_task<S: TaskStore>(store: &S) {
    let task = Task::new("test-task");
    store.save_task(&task).await.unwrap();

    store.delete_task(&task.id).await.unwrap();

    let retrieved = store.get_task(&task.id).await.unwrap();
    assert!(retrieved.is_none());
}
