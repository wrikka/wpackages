use crate::app::pty_app::PtyAppCallbacks;
use crate::error::Result;
use crate::types::{PtyConfig, SplitDirection, TabInfo, TabLayout};
use async_trait::async_trait;

#[async_trait]
pub trait TabApi {
    async fn create_tab(
        &self,
        config: PtyConfig,
        callbacks: PtyAppCallbacks,
    ) -> Result<TabLayout>;

    async fn split_pane(
        &self,
        tab_id: u32,
        pane_id_to_split: u32,
        direction: SplitDirection,
        config: PtyConfig,
        callbacks: PtyAppCallbacks,
    ) -> Result<TabLayout>;

    async fn close_pane(
        &self,
        tab_id: u32,
        pane_id_to_close: u32,
    ) -> Result<Option<TabLayout>>;

    async fn focus_pane(&self, tab_id: u32, pane_id: u32) -> Result<TabLayout>;

    async fn list_tabs(&self) -> Vec<TabInfo>;

    async fn set_active_tab(&self, tab_id: u32) -> Result<()>;

    async fn close_tab(&self, tab_id: u32) -> Result<()>;
}
