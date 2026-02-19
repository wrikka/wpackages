use crate::app::pty_app::{NativePtyAppCallbacks, PtyAppCallbacks};
use crate::error::Result;
use crate::types::{PtyConfig, PtySize};
use async_trait::async_trait;

#[async_trait]
pub trait SessionApi {
    async fn spawn(
        &self,
        config: PtyConfig,
        callbacks: PtyAppCallbacks,
    ) -> Result<u32>;

    async fn spawn_native(
        &self,
        config: PtyConfig,
        callbacks: NativePtyAppCallbacks,
    ) -> Result<u32>;

    async fn write(&self, session_id: u32, data: String) -> Result<()>;

    async fn write_many(&self, session_ids: Vec<u32>, data: String) -> Result<()>;

    async fn resize(&self, session_id: u32, rows: u16, cols: u16) -> Result<()>;

    async fn pid(&self, session_id: u32) -> Result<Option<u32>>;

    async fn kill(&self, session_id: u32) -> Result<()>;

    async fn close(&self, session_id: u32) -> Result<()>;

    async fn process(&self, session_id: u32) -> Result<Option<String>>;

    async fn get_size(&self, session_id: u32) -> Result<Option<PtySize>>;

    async fn is_alive(&self, session_id: u32) -> Result<bool>;

    async fn cwd(&self, session_id: u32) -> Result<Option<String>>;

    async fn spawn_ssh(
        &self,
        host: String,
        user: Option<String>,
        port: Option<u16>,
        rows: u16,
        cols: u16,
        callbacks: PtyAppCallbacks,
    ) -> Result<u32>;
}
