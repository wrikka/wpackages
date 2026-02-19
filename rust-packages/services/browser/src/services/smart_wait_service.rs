use crate::error::Result;
use async_trait::async_trait;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct SmartWaitConfig {
    pub default_timeout: Duration,
    pub poll_interval: Duration,
    pub stability_threshold: usize,
}

impl Default for SmartWaitConfig {
    fn default() -> Self {
        Self {
            default_timeout: Duration::from_secs(30),
            poll_interval: Duration::from_millis(100),
            stability_threshold: 3,
        }
    }
}

#[async_trait]
pub trait SmartWaitService: Send + Sync {
    async fn wait_for_element(
        &self,
        session_id: &str,
        selector: &str,
        timeout: Duration,
    ) -> Result<bool>;
    async fn wait_for_visible(
        &self,
        session_id: &str,
        selector: &str,
        timeout: Duration,
    ) -> Result<bool>;
    async fn wait_for_hidden(
        &self,
        session_id: &str,
        selector: &str,
        timeout: Duration,
    ) -> Result<bool>;
    async fn wait_for_clickable(
        &self,
        session_id: &str,
        selector: &str,
        timeout: Duration,
    ) -> Result<bool>;
    async fn wait_for_navigation(
        &self,
        session_id: &str,
        url_pattern: Option<&str>,
        timeout: Duration,
    ) -> Result<bool>;
    async fn wait_for_network_idle(
        &self,
        session_id: &str,
        idle_time: Duration,
        timeout: Duration,
    ) -> Result<bool>;
    async fn wait_for_stable(
        &self,
        session_id: &str,
        selector: &str,
        stability_count: usize,
        timeout: Duration,
    ) -> Result<bool>;
}
