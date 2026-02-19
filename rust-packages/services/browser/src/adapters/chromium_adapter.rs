use crate::components::WaitStrategy;
use crate::error::{Error, Result};
use crate::services::BrowserService;
use crate::types::{ActionRecord, BrowserType, Snapshot};
use async_trait::async_trait;
use chromiumoxide::Page;
use chromiumoxide::browser::{Browser, BrowserConfig};
use futures::StreamExt;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct ChromiumAdapter {
    sessions: Arc<Mutex<HashMap<String, ChromiumSession>>>,
}

struct ChromiumSession {
    browser: Browser,
    page: Option<Page>,
    handler_task: tokio::task::JoinHandle<()>,
}

impl ChromiumAdapter {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl Default for ChromiumAdapter {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl BrowserService for ChromiumAdapter {
    async fn launch(
        &self,
        browser_type: BrowserType,
        headless: bool,
        stealth: bool,
    ) -> Result<String> {
        if !browser_type.is_chromium() {
            return Err(Error::Other(
                "ChromiumAdapter only supports Chromium browser".to_string(),
            ));
        }

        let mut cfg_builder = BrowserConfig::builder();
        if !headless {
            cfg_builder = cfg_builder.with_head();
        }

        let mut cfg = cfg_builder
            .build()
            .map_err(|e| Error::Browser(e.to_string()))?;
        if stealth {
            cfg.stealth();
        }

        let (browser, mut handler) = Browser::launch(cfg)
            .await
            .map_err(|e| Error::Browser(e.to_string()))?;

        let handler_task = tokio::spawn(async move {
            while let Some(h) = handler.next().await {
                if h.is_err() {
                    break;
                }
            }
        });

        let session_id = uuid::Uuid::new_v4().to_string();
        let session = ChromiumSession {
            browser,
            page: None,
            handler_task,
        };

        self.sessions
            .lock()
            .await
            .insert(session_id.clone(), session);
        Ok(session_id)
    }

    async fn close(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.lock().await;
        if let Some(mut session) = sessions.remove(session_id) {
            session.browser.close().await?;
        }
        Ok(())
    }

    async fn navigate(&self, session_id: &str, url: &str) -> Result<()> {
        let mut sessions = self.sessions.lock().await;
        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| Error::SessionNotFound(session_id.to_string()))?;
        let page = session.browser.new_page(url).await?;
        session.page = Some(page);
        Ok(())
    }

    async fn back(&self, _session_id: &str) -> Result<()> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn forward(&self, _session_id: &str) -> Result<()> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn reload(&self, _session_id: &str) -> Result<()> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn snapshot(&self, _session_id: &str) -> Result<Snapshot> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn click(&self, _session_id: &str, _selector: &str) -> Result<()> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn type_text(&self, _session_id: &str, _selector: &str, _text: &str) -> Result<()> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn wait(&self, _session_id: &str, _strategy: &WaitStrategy) -> Result<()> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn screenshot(&self, _session_id: &str, _path: Option<&str>) -> Result<Vec<u8>> {
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn get_action_history(&self, _session_id: &str) -> Result<Vec<ActionRecord>> {
        Ok(vec![])
    }
}
