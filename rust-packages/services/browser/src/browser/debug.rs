use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::params::ScreenshotParams;
use crate::protocol::Response;
use serde_json::json;

pub async fn screenshot(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
    params: &ScreenshotParams,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    let bytes = page
        .screenshot(chromiumoxide::cdp::browser_protocol::page::CaptureScreenshotParams::builder().build())
        .await?;
    let path = params.path.clone().unwrap_or("screenshot.png".to_string());
    std::fs::write(&path, bytes)?;
    Ok(Response::success(
        "screenshot".to_string(),
        Some(json!({ "path": path })),
    ))
}

pub async fn get_console_logs(
    session_guard: &tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    // This is a placeholder. A real implementation would collect and return console logs.
    Ok(Response::success(
        "get_console_logs".to_string(),
        Some(json!({ "logs": [] })),
    ))
}
