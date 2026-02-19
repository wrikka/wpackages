use crate::app::api::{SessionApi, TabApi};
use crate::app::pty_app::{PtyApp, PtyAppCallbacks};
use crate::error::Result;
use crate::types::{PtyConfig, SplitDirection, TabInfo, TabLayout};
use async_trait::async_trait;

#[async_trait]
impl TabApi for PtyApp {
    async fn create_tab(
        &self,
        config: PtyConfig,
        callbacks: PtyAppCallbacks,
    ) -> Result<TabLayout> {
        let session_id = self.spawn(config, callbacks).await?;
        let layout = self.tab_service.create_tab(session_id).await;
        Ok(layout)
    }

    async fn split_pane(
        &self,
        tab_id: u32,
        pane_id_to_split: u32,
        direction: SplitDirection,
        config: PtyConfig,
        callbacks: PtyAppCallbacks,
    ) -> Result<TabLayout> {
        let new_session_id = self.spawn(config, callbacks).await?;
        match self
            .tab_service
            .split_pane(tab_id, pane_id_to_split, direction, new_session_id)
            .await
        {
            Ok((layout, _new_pane_id)) => Ok(layout),
            Err(e) => {
                self.kill(new_session_id).await?;
                Err(e)
            }
        }
    }

    async fn close_pane(
        &self,
        tab_id: u32,
        pane_id_to_close: u32,
    ) -> Result<Option<TabLayout>> {
        let (layout, session_id_to_kill) = self.tab_service.close_pane(tab_id, pane_id_to_close).await?;
        if let Some(session_id) = session_id_to_kill {
            self.kill(session_id).await?;
        }
        Ok(layout)
    }

    async fn focus_pane(&self, tab_id: u32, pane_id: u32) -> Result<TabLayout> {
        self.tab_service.focus_pane(tab_id, pane_id).await
    }

    async fn list_tabs(&self) -> Vec<TabInfo> {
        self.tab_service.list_tabs().await
    }

    async fn set_active_tab(&self, tab_id: u32) -> Result<()> {
        self.tab_service.set_active_tab(tab_id).await
    }

    async fn close_tab(&self, tab_id: u32) -> Result<()> {
        let sessions_to_kill = self.tab_service.close_tab(tab_id).await?;
        for session_id in sessions_to_kill {
            self.kill(session_id).await?;
        }
        Ok(())
    }
}
