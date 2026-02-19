use crate::Result;
use async_trait::async_trait;
use browser_use::{
    browser::BrowserManager,
    protocol::Action,
};

#[async_trait]
pub trait BrowserAdapter: Send + Sync {
    async fn create_browser(&self) -> Result<String>;
    async fn navigate(&self, browser_id: &str, url: &str) -> Result<()>;
    async fn execute_script(&self, browser_id: &str, script: &str) -> Result<String>;
    async fn take_screenshot(&self, browser_id: &str) -> Result<Vec<u8>>;
    async fn get_page_content(&self, browser_id: &str) -> Result<String>;
    async fn get_page_url(&self, browser_id: &str) -> Result<String>;
    async fn get_page_title(&self, browser_id: &str) -> Result<String>;
    async fn close_browser(&self, browser_id: &str) -> Result<()>;
    async fn close_all_browsers(&self) -> Result<()>;
}

pub struct AgentBrowserAdapter {
    browser_manager: BrowserManager,
}

impl AgentBrowserAdapter {
    pub fn new() -> Self {
        Self {
            browser_manager: BrowserManager::new(),
        }
    }
}

#[async_trait]
impl BrowserAdapter for AgentBrowserAdapter {
    async fn create_browser(&self) -> Result<String> {
        Ok("default".to_string())
    }

    async fn navigate(&self, browser_id: &str, url: &str) -> Result<()> {
        let _ = self
            .browser_manager
            .execute_action(browser_id, Action::Open, serde_json::json!({ "url": url }))
            .await
            .map_err(crate::error::AgentError::Browser)?;
        Ok(())
    }

    async fn execute_script(&self, browser_id: &str, script: &str) -> Result<String> {
        tracing::info!("Executing script in browser {}: {}", browser_id, script);
        Ok("script_result".to_string())
    }

        async fn take_screenshot(&self, browser_id: &str) -> Result<Vec<u8>> {
        let response = self
            .browser_manager
            .execute_action(browser_id, Action::Screenshot, serde_json::json!({}))
            .await
            .map_err(crate::error::AgentError::Browser)?;

        let data = response
            .data
            .and_then(|d| d.get("data").and_then(|v| v.as_str()).map(|s| s.to_string()))
            .unwrap_or_default();

        base64::decode(&data).map_err(|e| crate::error::AgentError::ServiceError {
            service_name: "base64".to_string(),
            source: e.into(),
        })
    }

    async fn get_page_content(&self, browser_id: &str) -> Result<String> {
        let response = self
            .browser_manager
            .execute_action(browser_id, Action::GetContent, serde_json::json!({}))
            .await
            .map_err(crate::error::AgentError::Browser)?;

        let content = response
            .data
            .and_then(|d| d.get("content").and_then(|v| v.as_str()).map(|s| s.to_string()))
            .unwrap_or_default();

        Ok(content)
    }

    async fn get_page_url(&self, browser_id: &str) -> Result<String> {
        let response = self
            .browser_manager
            .execute_action(browser_id, Action::GetUrl, serde_json::json!({}))
            .await
            .map_err(crate::error::AgentError::Browser)?;

        let url = response
            .data
            .and_then(|d| d.get("url").and_then(|v| v.as_str()).map(|s| s.to_string()))
            .unwrap_or_default();

        Ok(url)
    }

    async fn get_page_title(&self, browser_id: &str) -> Result<String> {
        let response = self
            .browser_manager
            .execute_action(browser_id, Action::GetTitle, serde_json::json!({}))
            .await
            .map_err(crate::error::AgentError::Browser)?;

        let title = response
            .data
            .and_then(|d| d.get("title").and_then(|v| v.as_str()).map(|s| s.to_string()))
            .unwrap_or_default();

        Ok(title)
    }

    async fn close_browser(&self, browser_id: &str) -> Result<()> {
        self.browser_manager
            .execute_action(browser_id, Action::Close, serde_json::json!({}))
            .await
            .map_err(crate::error::AgentError::Browser)?;
        Ok(())
    }

    async fn close_all_browsers(&self) -> Result<()> {
        Ok(())
    }
}
