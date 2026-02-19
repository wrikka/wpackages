use crate::browser::SessionState;
use crate::error::Result;
use crate::protocol::history::HistoryResponse;
use crate::protocol::Response;
use serde_json::json;

pub async fn get_history(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    let response_data = HistoryResponse {
        records: session_guard.action_history.clone(),
    };

    Ok(Response::success(
        "get_history".to_string(),
        Some(json!(response_data)),
    ))
}
