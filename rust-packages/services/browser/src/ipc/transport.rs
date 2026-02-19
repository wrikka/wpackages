use crate::error::Result;
use async_trait::async_trait;
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};

#[async_trait]
pub trait Transport: AsyncRead + AsyncWrite + Unpin + Send {
    async fn read_frame(&mut self) -> Result<Vec<u8>> {
        let len = self.read_u32().await? as usize;
        let mut buffer = vec![0; len];
        self.read_exact(&mut buffer).await?;
        Ok(buffer)
    }

    async fn write_frame(&mut self, buffer: &[u8]) -> Result<()> {
        self.write_u32(buffer.len() as u32).await?;
        self.write_all(buffer).await?;
        Ok(())
    }
}

impl<T: AsyncRead + AsyncWrite + Unpin + Send> Transport for T {}
