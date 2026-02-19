use crate::error::TaskError;

impl super::store::MySQLTaskStore {
    pub(crate) async fn init(&self) -> crate::error::Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL,
                priority INT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                started_at TIMESTAMP NULL,
                completed_at TIMESTAMP NULL,
                error TEXT NULL,
                metadata JSON NOT NULL,
                cron_expression VARCHAR(255) NULL,
                scheduled_at TIMESTAMP NULL,
                retry_count INT DEFAULT 0,
                max_retries INT DEFAULT 0,
                INDEX idx_status (status),
                INDEX idx_scheduled_at (scheduled_at),
                INDEX idx_priority (priority)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS task_results (
                task_id VARCHAR(36) PRIMARY KEY,
                success BOOLEAN NOT NULL,
                output JSON NULL,
                error TEXT NULL,
                duration_ms BIGINT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(TaskError::Database)?;

        Ok(())
    }
}
