use crate::components::WaitStrategy;
use crate::error::{Error, Result};
use crate::services::BrowserService;
use crate::types::{ActionRecord, BrowserType, Snapshot};
use async_trait::async_trait;

pub struct FirefoxAdapter;

impl FirefoxAdapter {
    pub fn new() -> Self {
        Self
    }
}

impl Default for FirefoxAdapter {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl BrowserService for FirefoxAdapter {
    async fn launch(
        &self,
        browser_type: BrowserType,
        _headless: bool,
        _stealth: bool,
    ) -> Result<String> {
        if !browser_type.is_firefox() {
            return Err(Error::Other(
                "FirefoxAdapter only supports Firefox browser".to_string(),
            ));
        }
        let session_id = uuid::Uuid::new_v4().to_string();
        Ok(session_id)
    }

    async fn close(&self, _session_id: &str) -> Result<()> {
        Ok(())
    }

    async fn navigate(&self, _session_id: &str, _url: &str) -> Result<()> {
        Ok(())
    }

    async fn back(&self, _session_id: &str) -> Result<()> {
        Ok(())
    }

    async fn forward(&self, _session_id: &str) -> Result<()> {
        Ok(())
    }

    async fn reload(&self, _session_id: &str) -> Result<()> {
        Ok(())
    }

    async fn snapshot(&self, _session_id: &str) -> Result<Snapshot> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn click(&self, _session_id: &str, _selector: &str) -> Result<()> {
        Ok(())
    }

    async fn type_text(&self, _session_id: &str, _selector: &str, _text: &str) -> Result<()> {
        Ok(())
    }

    async fn wait(&self, _session_id: &str, _strategy: &WaitStrategy) -> Result<()> {
        Ok(())
    }

    async fn screenshot(&self, _session_id: &str, _path: Option<&str>) -> Result<Vec<u8>> {
        Ok(vec![])
    }

    async fn get_action_history(&self, _session_id: &str) -> Result<Vec<ActionRecord>> {
        Ok(vec![])
    }
}
