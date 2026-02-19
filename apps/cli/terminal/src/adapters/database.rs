//! Database Adapter
//!
//! Wrapper for database clients (SQLite, etc.)

use rusqlite::{Connection, Result as SqliteResult};
use std::path::Path;

pub struct DatabaseAdapter {
    conn: Connection,
}

impl DatabaseAdapter {
    pub fn new<P: AsRef<Path>>(path: P) -> SqliteResult<Self> {
        let conn = Connection::open(path)?;
        Ok(Self { conn })
    }

    pub fn execute(&self, sql: &str, params: &[&dyn rusqlite::ToSql]) -> SqliteResult<usize> {
        self.conn.execute(sql, params)
    }

    pub fn query<F, R>(&self, sql: &str, params: &[&dyn rusqlite::ToSql], f: F) -> SqliteResult<R>
    where
        F: FnOnce(&rusqlite::Row) -> SqliteResult<R>,
    {
        let mut stmt = self.conn.prepare(sql)?;
        let mut rows = stmt.query(params)?;
        rows.next()?
            .map(f)
            .unwrap_or_else(|| Err(rusqlite::Error::QueryReturnedNoRows))
    }
}
