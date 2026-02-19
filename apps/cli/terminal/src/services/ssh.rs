use anyhow::{Context, Result};
use dashmap::DashMap;
use openssh::{Session, SessionBuilder};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use ssh2::{Session as Ssh2Session, Sftp};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SSHConnection {
    pub id: Uuid,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_method: AuthMethod,
    pub connected: bool,
    pub last_connected: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthMethod {
    Password {
        password: String,
    },
    Key {
        private_key_path: String,
        passphrase: Option<String>,
    },
    Agent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SFTPFile {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub is_dir: bool,
    pub modified: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferProgress {
    pub id: Uuid,
    pub connection_id: Uuid,
    pub source: String,
    pub destination: String,
    pub total_bytes: u64,
    pub transferred_bytes: u64,
    pub speed: f64,
    pub status: TransferStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransferStatus {
    Pending,
    InProgress,
    Completed,
    Failed { error: String },
    Cancelled,
}

pub struct SSHManager {
    connections: Arc<DashMap<Uuid, SSHConnection>>,
    sessions: Arc<DashMap<Uuid, Arc<Ssh2Session>>>,
    transfers: Arc<DashMap<Uuid, TransferProgress>>,
    connection_pool: Arc<RwLock<HashMap<String, Vec<Arc<Ssh2Session>>>>>,
}

impl SSHManager {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(DashMap::new()),
            sessions: Arc::new(DashMap::new()),
            transfers: Arc::new(DashMap::new()),
            connection_pool: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn connect(&self, connection: SSHConnection) -> Result<()> {
        let tcp =
            tokio::net::TcpStream::connect(format!("{}:{}", connection.host, connection.port))
                .await?;
        let mut session = Ssh2Session::new().unwrap();
        session.set_tcp_stream(tcp);
        session.handshake()?;

        match &connection.auth_method {
            AuthMethod::Password { password } => {
                session.userauth_password(&connection.username, password)?;
            }
            AuthMethod::Key {
                private_key_path,
                passphrase,
            } => {
                session.userauth_pubkey_file(
                    &connection.username,
                    None,
                    Path::new(private_key_path),
                    passphrase.as_deref(),
                )?;
            }
            AuthMethod::Agent => {
                session.userauth_agent(&connection.username)?;
            }
        }

        let id = connection.id;
        self.connections.insert(id, connection.clone());
        self.sessions.insert(id, Arc::new(session));

        self.add_to_pool(&connection.host, Arc::new(Ssh2Session::new().unwrap()))?;

        Ok(())
    }

    pub async fn disconnect(&self, connection_id: Uuid) -> Result<()> {
        self.sessions.remove(&connection_id);
        if let Some(mut conn) = self.connections.get_mut(&connection_id) {
            conn.connected = false;
        }
        Ok(())
    }

    pub async fn execute_command(&self, connection_id: Uuid, command: &str) -> Result<String> {
        let session = self
            .sessions
            .get(&connection_id)
            .ok_or_else(|| anyhow::anyhow!("Connection not found"))?;

        let mut channel = session.channel_session()?;
        channel.exec(command)?;

        let mut output = String::new();
        channel.read_to_string(&mut output)?;
        channel.wait_close()?;

        Ok(output)
    }

    pub async fn list_files(&self, connection_id: Uuid, path: &str) -> Result<Vec<SFTPFile>> {
        let session = self
            .sessions
            .get(&connection_id)
            .ok_or_else(|| anyhow::anyhow!("Connection not found"))?;

        let sftp = session.sftp()?;
        let mut files = Vec::new();

        let dir = sftp.readdir(Path::new(path))?;
        for (path, stat) in dir {
            let name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();

            if name.starts_with('.') {
                continue;
            }

            files.push(SFTPFile {
                path: path.to_string_lossy().to_string(),
                name,
                size: stat.size.unwrap_or(0) as u64,
                is_dir: stat.is_dir().unwrap_or(false),
                modified: chrono::DateTime::from_timestamp(stat.mtime.unwrap_or(0), 0)
                    .unwrap_or(chrono::Utc::now()),
            });
        }

        Ok(files)
    }

    pub async fn download_file(
        &self,
        connection_id: Uuid,
        remote_path: &str,
        local_path: &Path,
    ) -> Result<Uuid> {
        let session = self
            .sessions
            .get(&connection_id)
            .ok_or_else(|| anyhow::anyhow!("Connection not found"))?;

        let sftp = session.sftp()?;
        let mut remote_file = sftp.open(Path::new(remote_path))?;

        let transfer_id = Uuid::new_v4();
        let total_bytes = remote_file.stat()?.size.unwrap_or(0) as u64;

        let progress = TransferProgress {
            id: transfer_id,
            connection_id,
            source: remote_path.to_string(),
            destination: local_path.to_string_lossy().to_string(),
            total_bytes,
            transferred_bytes: 0,
            speed: 0.0,
            status: TransferStatus::Pending,
        };

        self.transfers.insert(transfer_id, progress.clone());

        let mut local_file = std::fs::File::create(local_path)?;
        let mut buffer = vec![0u8; 8192];
        let start = std::time::Instant::now();

        loop {
            let bytes_read = remote_file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }

            local_file.write_all(&buffer[..bytes_read])?;

            if let Some(mut p) = self.transfers.get_mut(&transfer_id) {
                p.transferred_bytes += bytes_read as u64;
                p.speed = bytes_read as f64 / start.elapsed().as_secs_f64();
                p.status = TransferStatus::InProgress;
            }
        }

        if let Some(mut p) = self.transfers.get_mut(&transfer_id) {
            p.status = TransferStatus::Completed;
        }

        Ok(transfer_id)
    }

    pub async fn upload_file(
        &self,
        connection_id: Uuid,
        local_path: &Path,
        remote_path: &str,
    ) -> Result<Uuid> {
        let session = self
            .sessions
            .get(&connection_id)
            .ok_or_else(|| anyhow::anyhow!("Connection not found"))?;

        let sftp = session.sftp()?;
        let mut remote_file = sftp.create(Path::new(remote_path))?;

        let transfer_id = Uuid::new_v4();
        let total_bytes = std::fs::metadata(local_path)?.len();

        let progress = TransferProgress {
            id: transfer_id,
            connection_id,
            source: local_path.to_string_lossy().to_string(),
            destination: remote_path.to_string(),
            total_bytes,
            transferred_bytes: 0,
            speed: 0.0,
            status: TransferStatus::Pending,
        };

        self.transfers.insert(transfer_id, progress.clone());

        let mut local_file = std::fs::File::open(local_path)?;
        let mut buffer = vec![0u8; 8192];
        let start = std::time::Instant::now();

        loop {
            let bytes_read = local_file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }

            remote_file.write_all(&buffer[..bytes_read])?;

            if let Some(mut p) = self.transfers.get_mut(&transfer_id) {
                p.transferred_bytes += bytes_read as u64;
                p.speed = bytes_read as f64 / start.elapsed().as_secs_f64();
                p.status = TransferStatus::InProgress;
            }
        }

        if let Some(mut p) = self.transfers.get_mut(&transfer_id) {
            p.status = TransferStatus::Completed;
        }

        Ok(transfer_id)
    }

    pub fn get_transfer_progress(&self, transfer_id: Uuid) -> Option<TransferProgress> {
        self.transfers.get(&transfer_id).map(|t| t.clone())
    }

    pub fn cancel_transfer(&self, transfer_id: Uuid) -> Result<()> {
        if let Some(mut transfer) = self.transfers.get_mut(&transfer_id) {
            transfer.status = TransferStatus::Cancelled;
        }
        Ok(())
    }

    pub fn get_connections(&self) -> Vec<SSHConnection> {
        self.connections
            .iter()
            .map(|entry| entry.value().clone())
            .collect()
    }

    pub fn get_connection(&self, id: Uuid) -> Option<SSHConnection> {
        self.connections.get(&id).map(|c| c.clone())
    }

    fn add_to_pool(&self, host: &str, session: Arc<Ssh2Session>) -> Result<()> {
        let mut pool = self.connection_pool.write();
        pool.entry(host.to_string())
            .or_insert_with(Vec::new)
            .push(session);
        Ok(())
    }

    fn get_from_pool(&self, host: &str) -> Option<Arc<Ssh2Session>> {
        let mut pool = self.connection_pool.write();
        pool.get_mut(host)?.pop()
    }

    pub fn save_connection(&self, connection: SSHConnection) -> Result<()> {
        self.connections.insert(connection.id, connection.clone());
        Ok(())
    }

    pub fn delete_connection(&self, id: Uuid) -> Result<()> {
        self.connections.remove(&id);
        self.sessions.remove(&id);
        Ok(())
    }
}

impl Default for SSHManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ssh_manager() {
        let manager = SSHManager::new();
        assert_eq!(manager.get_connections().len(), 0);
    }
}
