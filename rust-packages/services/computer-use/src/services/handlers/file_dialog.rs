use crate::error::{Error, Result};
use crate::protocol::Command;
use enigo::{Enigo, Key, Direction, Keyboard};
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_file_dialog(command: &Command, enigo: &Arc<Mutex<Enigo>>) -> Result<Option<serde_json::Value>> {
    let path = command.params["path"]
        .as_str()
        .ok_or_else(|| Error::InvalidCommand("Missing 'path' for handle-file-dialog".to_string()))?;

    let mut eg = enigo.lock().await;
    tokio::time::sleep(std::time::Duration::from_millis(500)).await; // Wait for dialog to be ready
    eg.text(path).map_err(|e| Error::Computer(e.to_string()))?;
    tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    eg.key(Key::Return, Direction::Click).map_err(|e| Error::Computer(e.to_string()))?;

    Ok(Some(serde_json::json!({ "status": "completed" })))
}
