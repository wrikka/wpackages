use super::{BrowserManager, PageState};
use crate::error::Result;
use crate::protocol::Response;

impl BrowserManager {
    pub(super) async fn get_title(&self, page_state: &PageState) -> Result<Response> {
        let title = page_state.title.clone().unwrap_or_default();
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "title": title }))))
    }

    pub(super) async fn get_url(&self, page_state: &PageState) -> Result<Response> {
        let url = page_state.url.clone().unwrap_or_default();
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "url": url }))))
    }
}
