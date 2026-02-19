use crate::browser::SessionState;
use crate::error::Result;
use crate::protocol::network::NetworkResponse;
use crate::protocol::Response;
use serde_json::json;

pub async fn get_network_requests(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    let response_data = NetworkResponse {
        requests: session_guard.network_requests.clone(),
    };

    Ok(Response::success(
        "get_network_requests".to_string(),
        Some(json!(response_data)),
    ))
}
