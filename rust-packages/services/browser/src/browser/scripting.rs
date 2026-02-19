use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::js_executor::{ExecuteJsRequest, ExecuteJsResponse};
use crate::protocol::Response;
use serde_json::json;

pub async fn execute_js(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
    params: &ExecuteJsRequest,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?; 

    let result = page
        .evaluate(params.script.clone())
        .await
        .map_err(|e| Error::JavaScript(e.to_string()))?;

    let value = result
        .into_value()
        .map_err(|e| Error::JavaScript(e.to_string()))?;

    let response_data = ExecuteJsResponse { result: value };

    Ok(Response::success(
        "execute_js".to_string(),
        Some(json!(response_data)),
    ))
}
