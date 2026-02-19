use crate::components::WaitStrategy;
use crate::error::Result;
use crate::types::{ActionRecord, BrowserType, Snapshot};
use async_trait::async_trait;

#[async_trait]
pub trait BrowserService: Send + Sync {
    async fn launch(
        &self,
        browser_type: BrowserType,
        headless: bool,
        stealth: bool,
    ) -> Result<String>;
    async fn close(&self, session_id: &str) -> Result<()>;
    async fn navigate(&self, session_id: &str, url: &str) -> Result<()>;
    async fn back(&self, session_id: &str) -> Result<()>;
    async fn forward(&self, session_id: &str) -> Result<()>;
    async fn reload(&self, session_id: &str) -> Result<()>;
    async fn snapshot(&self, session_id: &str) -> Result<Snapshot>;
    async fn click(&self, session_id: &str, selector: &str) -> Result<()>;
    async fn type_text(&self, session_id: &str, selector: &str, text: &str) -> Result<()>;
    async fn wait(&self, session_id: &str, strategy: &WaitStrategy) -> Result<()>;
    async fn screenshot(&self, session_id: &str, path: Option<&str>) -> Result<Vec<u8>>;
    async fn get_action_history(&self, session_id: &str) -> Result<Vec<ActionRecord>>;
}
