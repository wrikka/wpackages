use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::mpsc;
use uuid::Uuid;

use crate::services::ssh::{SSHConnection, SSHManager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Domain {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_method: crate::services::ssh::AuthMethod,
    pub created_at: DateTime<Utc>,
    pub last_connected: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteConnection {
    pub id: Uuid,
    pub domain_id: String,
    pub connected: bool,
    pub created_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemotePane {
    pub id: Uuid,
    pub connection_id: Uuid,
    pub pane_type: PaneType,
    pub shell: String,
    pub working_directory: Option<String>,
    pub size: PaneSize,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaneType {
    Tab,
    SplitHorizontal,
    SplitVertical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaneSize {
    pub rows: u16,
    pub cols: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiplexedSession {
    pub id: Uuid,
    pub domain_id: String,
    pub panes: Vec<RemotePane>,
    pub active_pane: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MultiplexerEvent {
    Connected { connection_id: Uuid },
    Disconnected { connection_id: Uuid },
    PaneCreated { pane: RemotePane },
    PaneDestroyed { pane_id: Uuid },
    PaneResized { pane_id: Uuid, size: PaneSize },
    OutputReceived { pane_id: Uuid, data: Vec<u8> },
}

pub struct RemoteMultiplexer {
    domains: Arc<RwLock<HashMap<String, Domain>>>,
    connections: Arc<RwLock<HashMap<Uuid, RemoteConnection>>>,
    sessions: Arc<RwLock<HashMap<Uuid, MultiplexedSession>>>,
    ssh_manager: Arc<SSHManager>,
    event_tx: mpsc::UnboundedSender<MultiplexerEvent>,
    event_rx: Arc<RwLock<Option<mpsc::UnboundedReceiver<MultiplexerEvent>>>>,
}

impl RemoteMultiplexer {
    pub fn new(ssh_manager: Arc<SSHManager>) -> Self {
        let (event_tx, event_rx) = mpsc::unbounded_channel();

        Self {
            domains: Arc::new(RwLock::new(HashMap::new())),
            connections: Arc::new(RwLock::new(HashMap::new())),
            sessions: Arc::new(RwLock::new(HashMap::new())),
            ssh_manager,
            event_tx,
            event_rx: Arc::new(RwLock::new(Some(event_rx))),
        }
    }

    pub async fn create_domain(&self, domain: Domain) -> Result<String> {
        let domain_id = domain.id.clone();
        self.domains.write().insert(domain_id.clone(), domain);
        Ok(domain_id)
    }

    pub fn get_domains(&self) -> Vec<Domain> {
        self.domains.read().values().cloned().collect()
    }

    pub fn get_domain(&self, domain_id: &str) -> Option<Domain> {
        self.domains.read().get(domain_id).cloned()
    }

    pub async fn connect(&self, domain_id: &str) -> Result<Uuid> {
        let domain = self
            .get_domain(domain_id)
            .ok_or_else(|| anyhow::anyhow!("Domain not found: {}", domain_id))?;

        let ssh_connection = SSHConnection {
            id: Uuid::new_v4(),
            name: domain.name.clone(),
            host: domain.host.clone(),
            port: domain.port,
            username: domain.username.clone(),
            auth_method: domain.auth_method.clone(),
            connected: false,
            last_connected: None,
        };

        self.ssh_manager.connect(ssh_connection.clone()).await?;

        let connection_id = ssh_connection.id;
        let remote_connection = RemoteConnection {
            id: connection_id,
            domain_id: domain_id.to_string(),
            connected: true,
            created_at: Utc::now(),
            last_activity: Utc::now(),
        };

        self.connections
            .write()
            .insert(connection_id, remote_connection.clone());

        if let Some(mut domain) = self.domains.write().get_mut(domain_id) {
            domain.last_connected = Some(Utc::now());
        }

        let _ = self
            .event_tx
            .send(MultiplexerEvent::Connected { connection_id });

        Ok(connection_id)
    }

    pub async fn disconnect(&self, connection_id: Uuid) -> Result<()> {
        self.ssh_manager.disconnect(connection_id).await?;

        if let Some(mut conn) = self.connections.write().get_mut(&connection_id) {
            conn.connected = false;
        }

        let _ = self
            .event_tx
            .send(MultiplexerEvent::Disconnected { connection_id });

        Ok(())
    }

    pub async fn create_session(&self, connection_id: Uuid) -> Result<Uuid> {
        let connection = self
            .connections
            .read()
            .get(&connection_id)
            .ok_or_else(|| anyhow::anyhow!("Connection not found"))?;

        let session_id = Uuid::new_v4();
        let session = MultiplexedSession {
            id: session_id,
            domain_id: connection.domain_id.clone(),
            panes: Vec::new(),
            active_pane: None,
            created_at: Utc::now(),
        };

        self.sessions.write().insert(session_id, session);

        Ok(session_id)
    }

    pub async fn create_pane(
        &self,
        connection_id: Uuid,
        pane_type: PaneType,
        shell: String,
        size: PaneSize,
    ) -> Result<Uuid> {
        let pane_id = Uuid::new_v4();
        let pane = RemotePane {
            id: pane_id,
            connection_id,
            pane_type,
            shell,
            working_directory: None,
            size,
            created_at: Utc::now(),
        };

        let _ = self
            .event_tx
            .send(MultiplexerEvent::PaneCreated { pane: pane.clone() });

        Ok(pane_id)
    }

    pub async fn send_input(&self, pane_id: Uuid, data: &[u8]) -> Result<()> {
        // Find connection for this pane and send input
        // This would be implemented with the actual SSH session
        Ok(())
    }

    pub async fn resize_pane(&self, pane_id: Uuid, size: PaneSize) -> Result<()> {
        let _ = self
            .event_tx
            .send(MultiplexerEvent::PaneResized { pane_id, size });

        Ok(())
    }

    pub async fn destroy_pane(&self, pane_id: Uuid) -> Result<()> {
        let _ = self
            .event_tx
            .send(MultiplexerEvent::PaneDestroyed { pane_id });

        Ok(())
    }

    pub fn get_connections(&self) -> Vec<RemoteConnection> {
        self.connections.read().values().cloned().collect()
    }

    pub fn get_connection(&self, connection_id: Uuid) -> Option<RemoteConnection> {
        self.connections.read().get(&connection_id).cloned()
    }

    pub fn get_sessions(&self) -> Vec<MultiplexedSession> {
        self.sessions.read().values().cloned().collect()
    }

    pub fn get_session(&self, session_id: Uuid) -> Option<MultiplexedSession> {
        self.sessions.read().get(&session_id).cloned()
    }

    pub fn subscribe_events(&self) -> Option<mpsc::UnboundedReceiver<MultiplexerEvent>> {
        self.event_rx.write().take()
    }

    pub async fn reconnect(&self, domain_id: &str) -> Result<Uuid> {
        // Auto-reconnect logic
        self.connect(domain_id).await
    }

    pub async fn persist_session(&self, session_id: Uuid) -> Result<()> {
        // Persist session to disk for recovery
        let session = self
            .get_session(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        let session_data = serde_json::to_string(&session)?;
        let session_dir = std::env::temp_dir().join("terminal-sessions");
        std::fs::create_dir_all(&session_dir)?;

        let session_file = session_dir.join(format!("{}.json", session_id));
        std::fs::write(session_file, session_data)?;

        Ok(())
    }

    pub async fn restore_session(&self, session_id: Uuid) -> Result<MultiplexedSession> {
        let session_dir = std::env::temp_dir().join("terminal-sessions");
        let session_file = session_dir.join(format!("{}.json", session_id));

        let session_data = std::fs::read_to_string(session_file)?;
        let session: MultiplexedSession = serde_json::from_str(&session_data)?;

        self.sessions.write().insert(session_id, session.clone());

        Ok(session)
    }

    pub async fn list_persisted_sessions(&self) -> Result<Vec<Uuid>> {
        let session_dir = std::env::temp_dir().join("terminal-sessions");
        let mut sessions = Vec::new();

        if let Ok(entries) = std::fs::read_dir(session_dir) {
            for entry in entries.flatten() {
                if let Some(name) = entry.file_name().to_str() {
                    if let Ok(uuid) = Uuid::parse_str(name.trim_end_matches(".json")) {
                        sessions.push(uuid);
                    }
                }
            }
        }

        Ok(sessions)
    }
}

impl Default for RemoteMultiplexer {
    fn default() -> Self {
        Self::new(Arc::new(SSHManager::new()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_remote_multiplexer() {
        let multiplexer = RemoteMultiplexer::default();

        let domain = Domain {
            id: "test-domain".to_string(),
            name: "Test Domain".to_string(),
            host: "localhost".to_string(),
            port: 22,
            username: "test".to_string(),
            auth_method: crate::services::ssh::AuthMethod::Agent,
            created_at: Utc::now(),
            last_connected: None,
        };

        let domain_id = multiplexer.create_domain(domain).await.unwrap();
        assert_eq!(domain_id, "test-domain");

        let domains = multiplexer.get_domains();
        assert_eq!(domains.len(), 1);
    }
}
