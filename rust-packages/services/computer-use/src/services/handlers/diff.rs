use crate::error::{Error, Result};
use crate::protocol::{Command, Snapshot};

pub fn handle_diff(_command: &Command, current_snapshot: Snapshot, saved_snapshot: &Option<Snapshot>) -> Result<Option<serde_json::Value>> {
    let previous_snapshot = saved_snapshot.as_ref().ok_or_else(|| Error::InvalidCommand("No snapshot saved to diff against. Use 'snapshot --save' first.".to_string()))?;

    let prev_str = serde_json::to_string_pretty(previous_snapshot).unwrap_or_default();
    let curr_str = serde_json::to_string_pretty(&current_snapshot).unwrap_or_default();

    let diff = similar::TextDiff::from_lines(&prev_str, &curr_str);
    let diff_str = diff.unified_diff().header("previous", "current").to_string();

    Ok(Some(serde_json::json!({ "diff": diff_str })))
}
