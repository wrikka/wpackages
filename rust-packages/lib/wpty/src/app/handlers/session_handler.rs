use crate::app::api::SessionApi;
use crate::app::pty_app::{NativePtyAppCallbacks, PtyApp, PtyAppCallbacks};
use crate::error::Result;
use crate::services::pty_service::PtyEventCallbacks as PtyServiceCallbacks;
use crate::types::{Hyperlink, PtyConfig, PtySize, ShellIntegrationEvent};
use async_trait::async_trait;
use napi::threadsafe_function::ThreadsafeFunctionCallMode;

#[async_trait]
impl SessionApi for PtyApp {
    async fn spawn(
        &self,
        config: PtyConfig,
        callbacks: PtyAppCallbacks,
    ) -> Result<u32> {
        let pty_callbacks = PtyServiceCallbacks {
            on_title_change: Box::new(move |title: String| {
                callbacks.on_title_change.call(Ok(title), ThreadsafeFunctionCallMode::Blocking);
            }),
            on_hyperlink: Box::new(move |hyperlink: Hyperlink| {
                callbacks.on_hyperlink.call(Ok(hyperlink), ThreadsafeFunctionCallMode::Blocking);
            }),
            on_shell_event: Box::new(move |event: ShellIntegrationEvent| {
                callbacks.on_shell_event.call(Ok(event), ThreadsafeFunctionCallMode::Blocking);
            }),
            on_sixel: Box::new(move |payload: Vec<u8>| {
                callbacks.on_sixel.call(Ok(payload), ThreadsafeFunctionCallMode::Blocking);
            }),
        };

        self._spawn_pty(config, pty_callbacks, None, Some(callbacks.on_data), Some(callbacks.on_exit)).await
    }

    async fn spawn_native(
        &self,
        config: PtyConfig,
        callbacks: NativePtyAppCallbacks,
    ) -> Result<u32> {
        let pty_callbacks = PtyServiceCallbacks {
            on_title_change: Box::new({
                let cb = callbacks.clone();
                move |title: String| {
                    (cb.on_title_change)(0, title); // Session ID 0 for now, needs context
                }
            }),
            on_hyperlink: Box::new({
                let cb = callbacks.clone();
                move |hyperlink: Hyperlink| {
                    (cb.on_hyperlink)(0, hyperlink);
                }
            }),
            on_shell_event: Box::new({
                let cb = callbacks.clone();
                move |event: ShellIntegrationEvent| {
                    (cb.on_shell_event)(0, event);
                }
            }),
            on_sixel: Box::new({
                let cb = callbacks.clone();
                move |payload: Vec<u8>| {
                    (cb.on_sixel)(0, payload);
                }
            }),
        };

        self._spawn_pty(config, pty_callbacks, Some(callbacks), None, None).await
    }

    async fn write(&self, session_id: u32, data: String) -> Result<()> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.get(session_id).await?;
        session.write(data.as_bytes()).await
    }

    async fn write_many(&self, session_ids: Vec<u32>, data: String) -> Result<()> {
        for session_id in session_ids {
            self.write(session_id, data.clone()).await?;
        }
        Ok(())
    }

    async fn resize(&self, session_id: u32, rows: u16, cols: u16) -> Result<()> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.get(session_id).await?;
        session.resize(rows, cols).await
    }

    async fn pid(&self, session_id: u32) -> Result<Option<u32>> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.get(session_id).await?;
        Ok(Some(session.pid))
    }

    async fn kill(&self, session_id: u32) -> Result<()> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.take(session_id).await?;
        session.close().await
    }

    async fn close(&self, session_id: u32) -> Result<()> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.take(session_id).await?;
        session.close().await
    }

    async fn process(&self, session_id: u32) -> Result<Option<String>> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.get(session_id).await?;
        Ok(Some(session.process().to_string()))
    }

    async fn get_size(&self, session_id: u32) -> Result<Option<PtySize>> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.get(session_id).await?;
        let size = session.get_size().await?;
        Ok(Some(PtySize { rows: size.rows, cols: size.cols }))
    }

    async fn is_alive(&self, session_id: u32) -> Result<bool> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.get(session_id).await?;
        Ok(session.is_alive().await)
    }

    async fn cwd(&self, session_id: u32) -> Result<Option<String>> {
        let session: std::sync::Arc<crate::services::pty_service::PtyService> = self.session_manager.get(session_id).await?;
        Ok(Some(session.cwd().await.to_string()))
    }

    async fn spawn_ssh(
        &self,
        host: String,
        user: Option<String>,
        port: Option<u16>,
        rows: u16,
        cols: u16,
        callbacks: PtyAppCallbacks,
    ) -> Result<u32> {
        let config = PtyConfig {
            command: "ssh".to_string(),
            args: {
                let mut args = Vec::new();
                if let Some(port) = port {
                    args.push("-p".to_string());
                    args.push(port.to_string());
                }
                let target = match user {
                    Some(user) => format!("{}@{}", user, host),
                    None => host,
                };
                args.push(target);
                args
            },
            cwd: None,
            initial_command: None,
            rows,
            cols,
        };

        self.spawn(config, callbacks).await
    }
}
