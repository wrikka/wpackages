//! IPC service for daemon communication

use async_trait::async_trait;
use crate::error::Result;
use crate::types::{Command, Response};

/// IPC service trait
#[async_trait]
pub trait IpcService: Send + Sync {
    /// Send command and receive response
    async fn send_command(&self, command: &Command) -> Result<Response>;

    /// Connect to daemon
    async fn connect(&self, addr: &str) -> Result<()>;
}

/// TCP-based IPC service
pub struct TcpIpcService {
    stream: Option<tokio::net::TcpStream>,
}

impl TcpIpcService {
    /// Create new TCP IPC service
    pub const fn new() -> Self {
        Self { stream: None }
    }
}

impl Default for TcpIpcService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl IpcService for TcpIpcService {
    async fn send_command(&self, _command: &Command) -> Result<Response> {
        Ok(Response::success("test", None))
    }

    async fn connect(&self, _addr: &str) -> Result<()> {
        Ok(())
    }
}
