use crate::error::{Error, Result};
use crate::protocol::Command;
use crate::snapshot::SnapshotBuilder;

pub fn handle_snapshot(
    command: &Command,
    snapshot_builder: &SnapshotBuilder,
    saved_snapshot: &mut Option<crate::protocol::Snapshot>,
) -> Result<Option<serde_json::Value>> {
    let snap = snapshot_builder.snapshot()?;
    let save = command.params.get("save").and_then(|v| v.as_bool()).unwrap_or(false);
    if save {
        *saved_snapshot = Some(snap.clone());
    }
    Ok(Some(
        serde_json::to_value(snap).map_err(|e| Error::Protocol(e.to_string()))?,
    ))
}
