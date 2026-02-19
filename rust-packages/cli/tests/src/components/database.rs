use crate::error::{TestingError, TestingResult};
use crate::types::Fixture;
use std::path::PathBuf;
use std::time::Duration;
use tracing::{debug, info};

#[cfg(feature = "database")]
use rusqlite::Connection;

pub struct DatabaseFixture {
    db_type: DatabaseType,
    connection_string: Option<String>,
    fixture: Fixture,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DatabaseType {
    Sqlite,
    Postgres,
    Mysql,
}

impl DatabaseFixture {
    pub fn sqlite() -> Self {
        Self {
            db_type: DatabaseType::Sqlite,
            connection_string: None,
            fixture: Fixture::new("sqlite_db"),
        }
    }

    pub fn postgres(connection_string: impl Into<String>) -> Self {
        Self {
            db_type: DatabaseType::Postgres,
            connection_string: Some(connection_string.into()),
            fixture: Fixture::new("postgres_db"),
        }
    }

    pub fn mysql(connection_string: impl Into<String>) -> Self {
        Self {
            db_type: DatabaseType::Mysql,
            connection_string: Some(connection_string.into()),
            fixture: Fixture::new("mysql_db"),
        }
    }

    pub fn with_schema(mut self, schema: impl Into<String>) -> Self {
        self.fixture = self.fixture.with_setup(schema);
        self
    }

    pub fn with_seed_data(mut self, data: impl Into<String>) -> Self {
        let current_setup = self.fixture.setup_script.clone().unwrap_or_default();
        self.fixture = self.fixture.with_setup(format!("{}\n{}", current_setup, data.into()));
        self
    }

    pub fn with_cleanup(mut self, cleanup: impl Into<String>) -> Self {
        self.fixture = self.fixture.with_teardown(cleanup);
        self
    }
}

#[cfg(feature = "database")]
pub struct SqliteFixture {
    connection: Connection,
    db_path: PathBuf,
}

#[cfg(feature = "database")]
impl SqliteFixture {
    pub fn new(db_path: PathBuf) -> TestingResult<Self> {
        let connection = Connection::open(&db_path)
            .map_err(|e| TestingError::database_error(format!("Failed to open database: {}", e)))?;

        info!("Created SQLite database at {:?}", db_path);
        Ok(Self { connection, db_path })
    }

    pub fn in_memory() -> TestingResult<Self> {
        let connection = Connection::open_in_memory()
            .map_err(|e| TestingError::database_error(format!("Failed to create in-memory database: {}", e)))?;

        let db_path = PathBuf::from(":memory:");
        Ok(Self { connection, db_path })
    }

    pub fn execute(&self, sql: &str) -> TestingResult<()> {
        self.connection
            .execute_batch(sql)
            .map_err(|e| TestingError::database_error(format!("SQL execution failed: {}", e)))?;
        Ok(())
    }

    pub fn query<T, F>(&self, sql: &str, f: F) -> TestingResult<Vec<T>>
    where
        F: Fn(&rusqlite::Row) -> rusqlite::Result<T>,
    {
        let mut stmt = self
            .connection
            .prepare(sql)
            .map_err(|e| TestingError::database_error(format!("Query preparation failed: {}", e)))?;

        let results = stmt
            .query_map([], f)
            .map_err(|e| TestingError::database_error(format!("Query execution failed: {}", e)))?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| TestingError::database_error(format!("Result mapping failed: {}", e)))?;

        Ok(results)
    }

    pub fn path(&self) -> &PathBuf {
        &self.db_path
    }

    pub fn connection(&self) -> &Connection {
        &self.connection
    }

    pub fn cleanup(&self) -> TestingResult<()> {
        if self.db_path != PathBuf::from(":memory:") && self.db_path.exists() {
            std::fs::remove_file(&self.db_path)?;
            debug!("Cleaned up database: {:?}", self.db_path);
        }
        Ok(())
    }
}

#[cfg(feature = "database")]
impl Drop for SqliteFixture {
    fn drop(&mut self) {
        let _ = self.cleanup();
    }
}

pub struct DatabaseFixtureManager {
    fixtures: Vec<Box<dyn std::any::Any>>,
    base_dir: PathBuf,
}

impl DatabaseFixtureManager {
    pub fn new(base_dir: PathBuf) -> Self {
        Self {
            fixtures: Vec::new(),
            base_dir,
        }
    }

    #[cfg(feature = "database")]
    pub fn create_sqlite(&mut self) -> TestingResult<SqliteFixture> {
        let db_path = self.base_dir.join(format!("test_{}.db", uuid::Uuid::new_v4()));
        SqliteFixture::new(db_path)
    }

    #[cfg(feature = "database")]
    pub fn create_sqlite_in_memory(&mut self) -> TestingResult<SqliteFixture> {
        SqliteFixture::in_memory()
    }
}

#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub db_type: DatabaseType,
    pub connection_string: String,
    pub pool_size: usize,
    pub timeout: Duration,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            db_type: DatabaseType::Sqlite,
            connection_string: String::new(),
            pool_size: 5,
            timeout: Duration::from_secs(30),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_fixture_builder() {
        let fixture = DatabaseFixture::sqlite()
            .with_schema("CREATE TABLE users (id INTEGER PRIMARY KEY);")
            .with_seed_data("INSERT INTO users VALUES (1);")
            .with_cleanup("DROP TABLE users;");

        assert_eq!(fixture.db_type, DatabaseType::Sqlite);
    }

    #[test]
    #[cfg(feature = "database")]
    fn test_sqlite_in_memory() {
        let fixture = SqliteFixture::in_memory().unwrap();
        fixture.execute("CREATE TABLE test (id INTEGER)").unwrap();
        fixture.execute("INSERT INTO test VALUES (1)").unwrap();

        let results: Vec<i32> = fixture
            .query("SELECT id FROM test", |row| row.get(0))
            .unwrap();

        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_database_config_default() {
        let config = DatabaseConfig::default();
        assert_eq!(config.db_type, DatabaseType::Sqlite);
        assert_eq!(config.pool_size, 5);
    }
}
