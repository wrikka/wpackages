use crate::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait ShadowDomService: Send + Sync {
    async fn find_in_shadow_dom(
        &self,
        session_id: &str,
        host_selector: &str,
        inner_selector: &str,
    ) -> Result<Option<String>>;
    async fn get_shadow_root(&self, session_id: &str, selector: &str) -> Result<Option<String>>;
    async fn click_in_shadow_dom(
        &self,
        session_id: &str,
        host_selector: &str,
        inner_selector: &str,
    ) -> Result<()>;
    async fn type_in_shadow_dom(
        &self,
        session_id: &str,
        host_selector: &str,
        inner_selector: &str,
        text: &str,
    ) -> Result<()>;
}
