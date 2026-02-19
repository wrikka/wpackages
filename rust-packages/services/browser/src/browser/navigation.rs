use super::{BrowserManager, SessionState};
use crate::error::{Error, Result};
use crate::protocol::Response;
use tracing::info;

impl BrowserManager {
    pub(super) async fn navigate(&self, session: &mut SessionState, params: &crate::protocol::params::OpenParams) -> Result<Response> {
        let url = &params.url;

        let page = session.browser.new_page(url).await.map_err(|e| Error::Chromium(e.to_string()))?;

        let title = page.get_title().await.map_err(|e| Error::Chromium(e.to_string()))?.unwrap_or_default();
        session.page_state.url = page.url().await.map_err(|e| Error::Chromium(e.to_string()))?;
        session.page_state.title = Some(title.clone());
        session.active_page = Some(page);

        Ok(Response::success(
            uuid::Uuid::new_v4().to_string(),
            Some(serde_json::json!({ "url": url, "title": title })),
        ))
    }

    pub(super) async fn back(&self, session: &mut SessionState) -> Result<Response> {
        let page = session.active_page.as_mut().ok_or(Error::NoPage)?;
        page.evaluate("history.back()").await.map_err(|e| Error::JavaScript(e.to_string()))?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    pub(super) async fn forward(&self, session: &mut SessionState) -> Result<Response> {
        let page = session.active_page.as_mut().ok_or(Error::NoPage)?;
        page.evaluate("history.forward()").await.map_err(|e| Error::JavaScript(e.to_string()))?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    pub(super) async fn reload(&self, session: &mut SessionState) -> Result<Response> {
        let page = session.active_page.as_mut().ok_or(Error::NoPage)?;
        page.evaluate("location.reload()").await.map_err(|e| Error::JavaScript(e.to_string()))?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }
}
