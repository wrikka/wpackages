use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::waits::{WaitCondition, WaitRequest};
use crate::protocol::Response;
use std::time::Duration;
use tokio::time::timeout;

pub async fn wait_for(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
    params: &WaitRequest,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    let timeout_duration = Duration::from_millis(params.timeout_ms.unwrap_or(30000)); // Default 30s

    match &params.condition {
        WaitCondition::Element { selector } => {
            timeout(timeout_duration, page.find_element(selector.as_str()))
                .await
                .map_err(|_| Error::Timeout(format!("Waiting for element '{}'", selector)))?
                .map_err(|e| Error::ElementNotFound(format!("{}: {}", selector, e)))?;
        }
    }

    Ok(Response::success("wait_for".to_string(), None))
}
