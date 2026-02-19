use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::params::{CloseTabParams, SwitchTabParams};
use crate::protocol::tabs::{TabInfo, TabsResponse};
use crate::protocol::Response;
use serde_json::json;

pub async fn get_tabs(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>) -> Result<Response> {
    let pages = session_guard.browser.pages().await.map_err(|e| Error::Chromium(e.to_string()))?;
    let mut tabs = Vec::new();
    for (index, page) in pages.iter().enumerate() {
        tabs.push(TabInfo {
            index,
            title: page.get_title().await.map_err(|e| Error::Chromium(e.to_string()))?.unwrap_or_default(),
            url: page.url().await.map_err(|e| Error::Chromium(e.to_string()))?.unwrap_or_default(),
        });
    }
    let response_data = TabsResponse { tabs };
    Ok(Response::success("get_tabs".to_string(), Some(json!(response_data))))
}

pub async fn new_tab(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>) -> Result<Response> {
    let page = session_guard.browser.new_page("about:blank").await.map_err(|e| Error::Chromium(e.to_string()))?;
    session_guard.active_page = Some(page);
    Ok(Response::success("new_tab".to_string(), None))
}

pub async fn switch_tab(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>, params: &SwitchTabParams) -> Result<Response> {
    let pages = session_guard.browser.pages().await.map_err(|e| Error::Chromium(e.to_string()))?;
    if let Some(page) = pages.get(params.index) {
        session_guard.active_page = Some(page.clone());
        Ok(Response::success("switch_tab".to_string(), None))
    } else {
        Err(Error::InvalidCommand(format!("Tab index {} out of bounds", params.index)))
    }
}

pub async fn close_tab(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>, params: &CloseTabParams) -> Result<Response> {
    let pages = session_guard.browser.pages().await.map_err(|e| Error::Chromium(e.to_string()))?;
    if let Some(page) = pages.get(params.index) {
        page.close().await.map_err(|e| Error::Chromium(e.to_string()))?;
        // Check if closed tab was the active one
        let active_url = session_guard.active_page.as_ref().map(|p| p.url());
        let closed_url = page.url();
        if let (Some(active), Ok(closed)) = (active_url, closed_url) {
            if active.map_err(|e| Error::Chromium(e.to_string()))? == closed {
                session_guard.active_page = None;
            }
        }
        Ok(Response::success("close_tab".to_string(), None))
    } else {
        Err(Error::InvalidCommand(format!("Tab index {} out of bounds", params.index)))
    }
}
