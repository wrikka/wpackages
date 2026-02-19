use crate::error::Result;
use crate::services::pty_service::{PtyEventCallbacks, PtyService};
use crate::types::{ExitEvent, Hyperlink, PtyConfig, ShellIntegrationEvent};
use std::sync::Arc;
use tokio::sync::mpsc;

pub struct PtySession {
    inner: Arc<PtyService>,
}

impl PtySession {
    pub async fn spawn(
        config: &PtyConfig,
        data_tx: mpsc::Sender<Vec<u8>>,
        on_title_change: impl Fn(String) + Send + 'static,
    ) -> Result<Self> {
        let callbacks = PtyEventCallbacks {
            on_title_change: Box::new(on_title_change),
            on_hyperlink: Box::new(|_hyperlink: Hyperlink| {}),
            on_shell_event: Box::new(|_event: ShellIntegrationEvent| {}),
            on_sixel: Box::new(|_payload: Vec<u8>| {}),
        };
        let session = PtyService::spawn(config, data_tx, callbacks).await?;

        Ok(Self {
            inner: Arc::new(session),
        })
    }

    pub async fn write(&self, data: &[u8]) -> Result<()> {
        self.inner.write(data).await
    }

    pub async fn resize(&self, rows: u16, cols: u16) -> Result<()> {
        self.inner.resize(rows, cols).await
    }

    pub async fn kill(&self) -> Result<()> {
        self.inner.kill().await
    }

    pub async fn wait_exit(&self) -> Option<ExitEvent> {
        self.inner.exit_rx.lock().await.recv().await
    }

    pub fn pid(&self) -> u32 {
        self.inner.pid
    }
}
