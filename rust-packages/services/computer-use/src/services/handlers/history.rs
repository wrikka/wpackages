use crate::daemon::execute_command;
use crate::error::{Error, Result};
use crate::protocol::Command;
use crate::snapshot::SnapshotBuilder;
use enigo::Enigo;
use std::sync::Arc;
use tokio::sync::Mutex;

pub fn handle_history(history: &mut Vec<Command>) -> Result<Option<serde_json::Value>> {
    let history_json = serde_json::to_value(history).map_err(|e| Error::Protocol(e.to_string()))?;
    Ok(Some(history_json))
}

pub fn handle_history_clear(history: &mut Vec<Command>) -> Result<Option<serde_json::Value>> {
    history.clear();
    Ok(None)
}

pub async fn handle_replay(
    command: &Command,
    snapshot_builder: &SnapshotBuilder,
    enigo: &Arc<Mutex<Enigo>>,
    history: &mut Vec<Command>,
    saved_snapshot: &mut Option<crate::protocol::Snapshot>,
) -> Result<Option<serde_json::Value>> {
    let last = command.params["last"]
        .as_u64()
        .ok_or_else(|| Error::InvalidCommand("Missing 'last' parameter for replay".to_string()))? as usize;

    if last == 0 {
        return Ok(None); // Nothing to replay
    }

    let to_replay = history.iter().rev().take(last).rev().cloned().collect::<Vec<_>>();

    for cmd in to_replay {
        let _ = execute_command(cmd, snapshot_builder, enigo, history, saved_snapshot).await?;
    }

    Ok(Some(serde_json::json!({ "replayed_commands": last })))
}
