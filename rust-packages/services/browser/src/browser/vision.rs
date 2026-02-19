use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::visual_snapshot::{BoundingBox, VisualSnapshotNode, VisualSnapshotResponse};
use crate::protocol::Response;
use chromiumoxide::cdp::browser_protocol::dom;
use serde_json::json;

async fn get_bounding_box(page: &chromiumoxide::Page, backend_node_id: i64) -> Result<BoundingBox> {
    let result = page
        .execute(dom::GetBoxModelParams::builder().backend_node_id(backend_node_id).build())
        .await
        .map_err(|e| Error::ElementNotFound(format!("Could not get box model: {}", e)))?;

    let model = result.model;
    let quad = &model.border;
    if quad.len() != 8 {
        return Err(Error::ElementNotFound("Invalid box model quad".to_string()));
    }

    let x = quad[0];
    let y = quad[1];
    let width = quad[4] - x;
    let height = quad[5] - y;

    Ok(BoundingBox { x, y, width, height })
}

pub async fn visual_snapshot(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    let last_snapshot = session_guard.last_snapshot.clone().ok_or(Error::NoSnapshot)?;

    // In a real implementation, we would take a screenshot and send it to a vision model.
    // For now, we simulate this by getting the bounding boxes of the existing snapshot nodes.

    let mut visual_nodes = Vec::new();

    for node in last_snapshot {
        if let Some(backend_node_id) = node.backend_dom_node_id {
            if let Ok(bounding_box) = get_bounding_box(page, backend_node_id as i64).await {
                visual_nodes.push(VisualSnapshotNode {
                    ref_id: node.ref_id.clone(),
                    description: format!("AI description for {} '{}'", node.role, node.name.unwrap_or_default()),
                    bounding_box,
                });
            }
        }
    }

    let response_data = VisualSnapshotResponse { nodes: visual_nodes };

    Ok(Response::success(
        "visual_snapshot".to_string(),
        Some(json!(response_data)),
    ))
}
