#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[cfg(feature = "postgres")]
    async fn test_postgres_store() {
        // This test requires a running PostgreSQL instance
        // Set DATABASE_URL environment variable to test
        let database_url = std::env::var("DATABASE_URL_POSTGRES")
            .unwrap_or_else(|_| "postgresql://postgres:password@localhost/task_test".to_string());

        let store = PostgresTaskStore::new(&database_url).await.unwrap();

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
