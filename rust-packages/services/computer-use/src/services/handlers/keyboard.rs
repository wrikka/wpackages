use crate::error::{Error, Result};
use crate::protocol::Command;
use enigo::{Enigo, Keyboard, Key, Direction};
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_type(command: &Command, enigo: &Arc<Mutex<Enigo>>) -> Result<Option<serde_json::Value>> {
    let text = command.params["text"]
        .as_str()
        .ok_or_else(|| Error::InvalidCommand("Missing text".to_string()))?;
    let mut eg = enigo.lock().await;
    eg.text(text).map_err(|e| Error::Computer(e.to_string()))?;
    Ok(None)
}

pub async fn handle_press(command: &Command, enigo: &Arc<Mutex<Enigo>>) -> Result<Option<serde_json::Value>> {
    let key = command.params["key"]
        .as_str()
        .ok_or_else(|| Error::InvalidCommand("Missing key".to_string()))?;
    let mut eg = enigo.lock().await;
    // Minimal key mapping
    match key.to_lowercase().as_str() {
        "enter" => eg.key(Key::Return, Direction::Click),
        "tab" => eg.key(Key::Tab, Direction::Click),
        "escape" | "esc" => eg.key(Key::Escape, Direction::Click),
        _ => return Err(Error::InvalidCommand(format!("Unsupported key: {}", key))),
    }
    .map_err(|e| Error::Computer(e.to_string()))?;
    Ok(None)
}

pub async fn handle_type_text(
    _command: &Command,
    enigo: &Arc<Mutex<Enigo>>,
    _element_id: &String,
    text: &String,
) -> Result<Option<serde_json::Value>> {
    // TODO: Find element by ID and type text into it
    let mut eg = enigo.lock().await;
    eg.text(text).map_err(|e| Error::Computer(e.to_string()))?;
    Ok(Some(serde_json::json!({ "typed_text": text })))
}

pub async fn handle_delete(
    _command: &Command,
    enigo: &Arc<Mutex<Enigo>>,
) -> Result<Option<serde_json::Value>> {
    let mut eg = enigo.lock().await;
    eg.key(Key::Delete, Direction::Click)
        .map_err(|e| Error::Computer(e.to_string()))?;
    Ok(None)
}
