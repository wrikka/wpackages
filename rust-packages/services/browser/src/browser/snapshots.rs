use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::{Response, Snapshot, snapshot_diff::SnapshotDiff};
use serde_json::json;
use std::collections::HashSet;

pub async fn snapshot(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    let mut snapshot_builder = session_guard.snapshot_builder.lock().await;
    let nodes = snapshot_builder.build(page).await?;
    drop(snapshot_builder); // Release lock before mutating session_guard

    let snapshot = Snapshot {
        url: session_guard.page_state.url.clone().unwrap_or_default(),
        title: session_guard.page_state.title.clone().unwrap_or_default(),
        nodes: nodes.clone(),
    };

    session_guard.last_snapshot = Some(nodes);

    Ok(Response::success(
        "snapshot".to_string(),
        Some(json!(snapshot)),
    ))
}

pub async fn diff_snapshot(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    let last_snapshot = session_guard.last_snapshot.clone().unwrap_or_default();
    
    // Take a new snapshot without creating a response yet
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    let mut snapshot_builder = session_guard.snapshot_builder.lock().await;
    let new_nodes = snapshot_builder.build(page).await?;
    drop(snapshot_builder); // Release lock before mutating session_guard

    let old_ids: HashSet<_> = last_snapshot.iter().map(|n| &n.ref_id).collect();
    let new_ids: HashSet<_> = new_nodes.iter().map(|n| &n.ref_id).collect();

    let added_nodes = new_nodes
        .iter()
        .filter(|n| !old_ids.contains(&n.ref_id))
        .cloned()
        .collect();

    let removed_nodes = last_snapshot
        .iter()
        .filter(|n| !new_ids.contains(&n.ref_id))
        .cloned()
        .collect();

    session_guard.last_snapshot = Some(new_nodes);

    let diff = SnapshotDiff {
        added: added_nodes,
        removed: removed_nodes,
    };

    Ok(Response::success(
        "diff_snapshot".to_string(),
        Some(json!(diff)),
    ))
}
