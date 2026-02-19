use crate::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait HeadlessToggleService: Send + Sync {
    async fn is_headless(&self, session_id: &str) -> Result<bool>;
    async fn toggle_headless(&self, session_id: &str, headless: bool) -> Result<()>;
    async fn get_headless_mode(&self, session_id: &str) -> Result<HeadlessMode>;
}

#[derive(Debug, Clone)]
pub enum HeadlessMode {
    New,     // Chrome's new headless mode
    Old,     // Legacy headless mode
    Headful, // Not headless
}

impl Default for HeadlessMode {
    fn default() -> Self {
        Self::New
    }
}
