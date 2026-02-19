use sqlx::mysql::MySqlPool;

pub struct MySQLTaskStore {
    pub(crate) pool: MySqlPool,
}

impl MySQLTaskStore {
    pub async fn new(database_url: &str) -> crate::error::Result<Self> {
        let pool = MySqlPool::connect(database_url).await.map_err(crate::error::TaskError::Database)?;

        let store = Self { pool };
        store.init().await?;
        Ok(store)
    }

    pub fn pool(&self) -> &MySqlPool {
        &self.pool
    }
}
