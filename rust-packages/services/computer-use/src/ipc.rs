use crate::error::{Error, Result};
use crate::protocol::{Command, Response};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

pub struct IpcServer {
    listener: TcpListener,
}

impl IpcServer {
    pub async fn bind(addr: &str) -> Result<Self> {
        let listener = TcpListener::bind(addr)
            .await
            .map_err(|e| Error::Ipc(e.to_string()))?;
        Ok(Self { listener })
    }

    pub async fn accept(&self) -> Result<IpcConnection> {
        let (stream, _) = self
            .listener
            .accept()
            .await
            .map_err(|e| Error::Ipc(e.to_string()))?;
        Ok(IpcConnection::new(stream))
    }
}

pub struct IpcConnection {
    stream: TcpStream,
}

impl IpcConnection {
    pub fn new(stream: TcpStream) -> Self {
        Self { stream }
    }

    pub async fn send_command(&mut self, command: &Command) -> Result<()> {
        let json = serde_json::to_vec(command)?;
        let len = json.len() as u32;

        self.stream.write_all(&len.to_be_bytes()).await?;
        self.stream.write_all(&json).await?;
        self.stream.flush().await?;
        Ok(())
    }

    pub async fn receive_command(&mut self) -> Result<Command> {
        let mut len_buf = [0u8; 4];
        self.stream.read_exact(&mut len_buf).await?;
        let len = u32::from_be_bytes(len_buf) as usize;

        let mut buf = vec![0u8; len];
        self.stream.read_exact(&mut buf).await?;
        Ok(serde_json::from_slice(&buf)?)
    }

    pub async fn send_response(&mut self, response: &Response) -> Result<()> {
        let json = serde_json::to_vec(response)?;
        let len = json.len() as u32;

        self.stream.write_all(&len.to_be_bytes()).await?;
        self.stream.write_all(&json).await?;
        self.stream.flush().await?;
        Ok(())
    }

    pub async fn receive_response(&mut self) -> Result<Response> {
        let mut len_buf = [0u8; 4];
        self.stream.read_exact(&mut len_buf).await?;
        let len = u32::from_be_bytes(len_buf) as usize;

        let mut buf = vec![0u8; len];
        self.stream.read_exact(&mut buf).await?;
        Ok(serde_json::from_slice(&buf)?)
    }
}
