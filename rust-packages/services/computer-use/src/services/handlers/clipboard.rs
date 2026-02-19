use crate::error::{Error, Result};
use crate::protocol::Command;

pub fn handle_set_clipboard(command: &Command) -> Result<Option<serde_json::Value>> {
    let text = command.params["text"]
        .as_str()
        .ok_or_else(|| Error::InvalidCommand("Missing 'text' for set-clipboard".to_string()))?;
    let mut clipboard = arboard::Clipboard::new().map_err(|e| Error::Computer(e.to_string()))?;
    clipboard.set_text(text).map_err(|e| Error::Computer(e.to_string()))?;
    Ok(None)
}

pub fn handle_get_clipboard() -> Result<Option<serde_json::Value>> {
    let mut clipboard = arboard::Clipboard::new().map_err(|e| Error::Computer(e.to_string()))?;
    let text = clipboard.get_text().map_err(|e| Error::Computer(e.to_string()))?;
    Ok(Some(serde_json::json!({ "text": text })))
}
