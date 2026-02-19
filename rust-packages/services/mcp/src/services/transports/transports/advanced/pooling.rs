use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, Semaphore};
use tracing::{debug, warn};

#[derive(Debug, Clone)]
pub struct PoolConfig {
    pub max_connections: usize,
    pub min_connections: usize,
    pub max_idle_time: Duration,
    pub connection_timeout: Duration,
    pub keep_alive: bool,
}

impl Default for PoolConfig {
    fn default() -> Self {
        Self {
            max_connections: 100,
            min_connections: 5,
            max_idle_time: Duration::from_secs(300),
            connection_timeout: Duration::from_secs(30),
            keep_alive: true,
        }
    }
}

pub struct PooledConnection {
    created_at: Instant,
    last_used: Arc<Mutex<Instant>>,
}

impl PooledConnection {
    pub fn new() -> Self {
        let now = Instant::now();
        Self {
            created_at: now,
            last_used: Arc::new(Mutex::new(now)),
        }
    }

    pub fn is_expired(&self, max_idle_time: Duration) -> bool {
        let last_used = *self.last_used.lock().unwrap();
        last_used.elapsed() > max_idle_time
    }

    pub fn update_last_used(&self) {
        let mut last_used = self.last_used.lock().unwrap();
        *last_used = Instant::now();
    }
}

pub struct ConnectionPool {
    config: PoolConfig,
    connections: Arc<Mutex<Vec<PooledConnection>>>,
    semaphore: Arc<Semaphore>,
}

impl ConnectionPool {
    pub fn new(config: PoolConfig) -> Self {
        let max_connections = config.max_connections;
        Self {
            config,
            connections: Arc::new(Mutex::new(Vec::new())),
            semaphore: Arc::new(Semaphore::new(max_connections)),
        }
    }

    pub async fn acquire(&self) -> Result<PooledConnection, String> {
        debug!("Acquiring connection from pool");

        let _permit = self.semaphore.acquire().await.map_err(|e| e.to_string())?;

        let mut connections = self.connections.lock().unwrap();

        if let Some(conn) = connections.pop() {
            debug!("Reusing existing connection");
            conn.update_last_used();
            Ok(conn)
        } else {
            debug!("Creating new connection");
            Ok(PooledConnection::new())
        }
    }

    pub async fn release(&self, conn: PooledConnection) {
        debug!("Releasing connection back to pool");

        let mut connections = self.connections.lock().unwrap();

        if connections.len() < self.config.max_connections {
            connections.push(conn);
        }
    }

    pub async fn cleanup(&self) {
        debug!("Cleaning up expired connections");

        let mut connections = self.connections.lock().unwrap();
        connections.retain(|conn| !conn.is_expired(self.config.max_idle_time));
    }

    pub fn active_connections(&self) -> usize {
        self.connections.lock().unwrap().len()
    }
}
