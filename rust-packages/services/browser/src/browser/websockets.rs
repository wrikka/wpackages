use crate::browser::SessionState;
use crate::error::Result;
use crate::protocol::websockets::WebSocketFramesResponse;
use crate::protocol::Response;
use serde_json::json;

pub async fn get_websocket_frames(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    let response_data = WebSocketFramesResponse {
        frames: session_guard.websocket_frames.clone(),
    };

    Ok(Response::success(
        "get_websocket_frames".to_string(),
        Some(json!(response_data)),
    ))
}
