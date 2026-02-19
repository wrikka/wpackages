pub mod transport;

use crate::error::{Error, Result};
use crate::protocol::{Command, Response};
use tokio::net::{TcpListener, TcpStream, ToSocketAddrs};
use transport::Transport;

pub struct IpcServer {
    listener: TcpListener,
}

impl IpcServer {
    pub async fn bind<A: ToSocketAddrs>(addr: A) -> Result<Self> {
        let listener = TcpListener::bind(addr).await?;
        Ok(Self { listener })
    }

    pub async fn accept(&self) -> Result<(IpcConnection<TcpStream>, String)> {
        let (stream, addr) = self
            .listener
            .accept()
            .await
            .map_err(|e| Error::Ipc(e.to_string()))?;
        Ok((IpcConnection::new(stream), addr.to_string()))
    }
}

pub struct IpcConnection<T: Transport> {
    transport: T,
}

impl IpcConnection<TcpStream> {
    pub async fn connect<A: ToSocketAddrs>(addr: A) -> Result<Self> {
        let stream = TcpStream::connect(addr).await?;
        Ok(Self::new(stream))
    }
}

impl<T: Transport> IpcConnection<T> {
    pub fn new(transport: T) -> Self {
        Self { transport }
    }

    pub async fn send_command(&mut self, command: &Command) -> Result<()> {
        let buffer = serde_json::to_vec(command)?;
        self.transport.write_frame(&buffer).await
    }

    pub async fn receive_response(&mut self) -> Result<Response> {
        let buffer = self.transport.read_frame().await?;
        serde_json::from_slice(&buffer).map_err(Into::into)
    }

    pub async fn receive_command(&mut self) -> Result<Command> {
        let buffer = self.transport.read_frame().await?;
        serde_json::from_slice(&buffer).map_err(Into::into)
    }

    pub async fn send_response(&mut self, response: &Response) -> Result<()> {
        let buffer = serde_json::to_vec(response)?;
        self.transport.write_frame(&buffer).await
    }
}
