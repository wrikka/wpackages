use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::har::{Har, HarCreator, HarEntry, HarHeader, HarLog, HarRequest, HarResponse, HarTimings};
use crate::protocol::Response;
use crate::browser::network_logger::NetworkEvent;
use serde_json::json;
use std::collections::HashMap;

pub async fn get_har(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>) -> Result<Response> {
    let mut entries = HashMap::new();

    for event in &session_guard.network_events {
        match event {
            NetworkEvent::RequestWillBeSent(e) => {
                let entry = entries.entry(e.request_id.clone()).or_insert_with(|| HarEntry {
                    started_date_time: format!("{:?}", e.wall_time),
                    request: HarRequest {
                        method: e.request.method.clone(),
                        url: e.request.url.clone(),
                        headers: e.request.headers.iter()
                            .map(|(k, v)| HarHeader { name: k.clone(), value: v.clone() })
                            .collect(),
                    },
                    response: HarResponse { status: 0, status_text: "".to_string(), headers: vec![] },
                    timings: HarTimings::default(),
                });
            }
            NetworkEvent::ResponseReceived(e) => {
                if let Some(entry) = entries.get_mut(&e.request_id) {
                    entry.response = HarResponse {
                        status: e.response.status,
                        status_text: e.response.status_text.clone(),
                        headers: e.response.headers.iter()
                            .map(|(k, v)| HarHeader { name: k.clone(), value: v.clone() })
                            .collect(),
                    };
                }
            }
            NetworkEvent::LoadingFinished(e) => {
                if let Some(entry) = entries.get_mut(&e.request_id) {
                    // Simplified timings. A real implementation would be more detailed.
                    entry.timings.receive = e.encoded_data_length;
                }
            }
        }
    }

    let har = Har {
        log: HarLog {
            version: "1.2".to_string(),
            creator: HarCreator { name: "browser-use".to_string(), version: env!("CARGO_PKG_VERSION").to_string() },
            entries: entries.into_values().collect(),
        },
    };

    Ok(Response::success("get_har".to_string(), Some(json!(har))))
}
